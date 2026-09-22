import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verificationAttemptSchema, VerificationAttemptInput } from '@/lib/validations/verification';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// In-memory sliding-window rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = parseInt(process.env.VERIFICATION_RATE_LIMIT_MAX_ATTEMPTS || '5', 10);
const WINDOW_MS = parseInt(process.env.VERIFICATION_RATE_LIMIT_WINDOW_SECONDS || '60', 10) * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }

  record.count += 1;
  return false;
}

interface ExtractedLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  source: 'browser' | 'network' | 'unavailable';
}

async function extractRequestLocation(
  req: NextRequest,
  clientLocation?: VerificationAttemptInput['location']
): Promise<ExtractedLocation> {
  // 1. Browser Geolocation takes precedence for lat/lng (but only if granted)
  if (clientLocation?.source === 'browser' && clientLocation.latitude && clientLocation.longitude) {
    try {
      // Optional: Fast, non-blocking reverse geocode via BigDataCloud (No API Key)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${clientLocation.latitude}&longitude=${clientLocation.longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city || data.locality || null,
          region: data.principalSubdivision || null,
          country: data.countryCode || data.countryName || null,
          lat: clientLocation.latitude,
          lng: clientLocation.longitude,
          source: 'browser',
        };
      }
    } catch {
      // Ignore errors/timeout, fall through to returning just coords
    }
    return {
      city: null,
      region: null,
      country: null,
      lat: clientLocation.latitude,
      lng: clientLocation.longitude,
      source: 'browser',
    };
  }

  // 2. Fallback to Server Headers (Vercel)
  const city = req.headers.get('x-vercel-ip-city') 
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city') as string)
    : req.headers.get('cf-ipcity') || null;
  
  const region = req.headers.get('x-vercel-ip-country-region') || req.headers.get('cf-region') || null;
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || null;

  if (city || region || country) {
    return {
      city,
      region,
      country,
      lat: null, // We do NOT store network lat/lng as it's often misleading and unconsented
      lng: null,
      source: 'network',
    };
  }

  // 3. Localhost / Unavailable
  return {
    city: null,
    region: null,
    country: null,
    lat: null,
    lng: null,
    source: 'unavailable',
  };
}

async function recordVerificationEvent(
  supabase: SupabaseClient,
  event: any,
  location: ExtractedLocation
) {
  const formatted = [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ') || 'Unavailable';

  const locationAccuracyJson = JSON.stringify({
    city: location.city,
    region: location.region,
    country: location.country,
    source: location.source,
    formatted,
  });

  const basePayload = {
    ...event,
    location_status: location.source,
    location_lat: location.lat,
    location_lng: location.lng,
    location_accuracy: locationAccuracyJson,
  };

  const extendedPayload = {
    ...basePayload,
    location_city: location.city,
    location_region: location.region,
    location_country: location.country,
    location_source: location.source,
  };

  // Attempt insert with extended columns (in case migration ran)
  const { error } = await supabase.from('verification_events').insert(extendedPayload);

  if (error) {
    // If column doesn't exist yet, fallback to base payload
    if (error.code === 'PGRST204' || error.message.includes('column') || error.code === '42703') {
      await supabase.from('verification_events').insert(basePayload);
    } else {
      console.error('[Verification API] Insert Error:', error);
      throw error;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate phone and code structure
    const validation = verificationAttemptSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        {
          outcome: 'invalid',
          error: firstIssue?.message || 'Invalid mobile number or scratch code format.',
        },
        { status: 400 }
      );
    }

    const { mobile, code, location: clientLocation } = validation.data;

    // 2. Client identification & rate limiting
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const rateLimitKey = `${clientIp}:${mobile}`;

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        {
          outcome: 'rate_limited',
          error: 'Too many verification attempts. Please wait a minute before trying again.',
        },
        { status: 429 }
      );
    }

    // Extract Location metadata
    const locationInfo = await extractRequestLocation(req, clientLocation);

    // 3. Cryptographic Hashes & Safe Fingerprints
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const mobileHash = crypto.createHash('sha256').update(mobile).digest('hex');
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');
    const mobileMasked = `+91 XXXXX ${mobile.slice(-4)}`;
    const submittedFingerprint = `MW-***-${code.slice(-4)}`;
    const userAgent = req.headers.get('user-agent') || 'Unknown Client';

    const supabase = createAdminClient();

    // 4. Look up code in verification_codes table
    const { data: codeRecord, error: fetchError } = await supabase
      .from('verification_codes')
      .select('id, batch_id, status, generated_at, status_changed_at')
      .eq('code_hash', codeHash)
      .maybeSingle();

    if (fetchError) {
      console.error('[Verify API] Database error:', fetchError);
      return NextResponse.json(
        {
          outcome: 'invalid',
          error: 'Unable to verify code at this time. Please try again.',
        },
        { status: 500 }
      );
    }

    const correlationId = crypto.randomUUID();

    const baseEventData = {
      submitted_code_fingerprint: submittedFingerprint,
      mobile_hash: mobileHash,
      mobile_masked: mobileMasked,
      ip_hash: ipHash,
      device_ua: userAgent,
      request_correlation_id: correlationId,
    };

    // Case 1: Code Not Found in Database
    if (!codeRecord) {
      await recordVerificationEvent(supabase, {
        ...baseEventData,
        outcome: 'invalid',
      }, locationInfo);

      return NextResponse.json(
        {
          outcome: 'invalid',
          error: 'This code does not exist in our verified database. Please check all 12 characters.',
        },
        { status: 404 }
      );
    }

    // Case 2: Code is Disabled or Revoked
    if (codeRecord.status === 'disabled' || codeRecord.status === 'revoked') {
      await recordVerificationEvent(supabase, {
        ...baseEventData,
        code_id: codeRecord.id,
        outcome: 'disabled',
      }, locationInfo);

      return NextResponse.json(
        {
          outcome: 'disabled',
          error: 'This security code has been deactivated by administrators. Please contact customer support.',
        },
        { status: 403 }
      );
    }

    // Case 3: Check if Code was Already Verified (Repeat Attempt)
    const { data: verifiedEvent } = await supabase
      .from('verification_events')
      .select('created_at')
      .eq('code_id', codeRecord.id)
      .eq('outcome', 'verified')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (verifiedEvent) {
      await recordVerificationEvent(supabase, {
        ...baseEventData,
        code_id: codeRecord.id,
        outcome: 'already_verified',
      }, locationInfo);

      return NextResponse.json({
        outcome: 'already_verified',
        message:
          'This scratch code was previously authenticated. If you did not scratch and verify this code yourself, it may be a counterfeit.',
        firstVerifiedAt: verifiedEvent.created_at,
      });
    }

    // Case 4: Code is Active & Unconsumed -> Record successful verification event
    const nowIso = new Date().toISOString();
    await recordVerificationEvent(supabase, {
      ...baseEventData,
      code_id: codeRecord.id,
      outcome: 'verified',
    }, locationInfo);

    return NextResponse.json({
      outcome: 'verified',
      message: 'This scratch code is authentic and 100% genuine Muscle Weapon product.',
      verifiedAt: nowIso,
    });
  } catch (err: unknown) {
    console.error('[Verification API Error]:', err);
    return NextResponse.json(
      {
        outcome: 'invalid',
        error: 'An unexpected system error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
