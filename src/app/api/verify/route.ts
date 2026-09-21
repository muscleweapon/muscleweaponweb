import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verificationAttemptSchema } from '@/lib/validations/verification';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const { mobile, code, location } = validation.data;

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

    // Case 1: Code Not Found in Database
    if (!codeRecord) {
      await supabase.from('verification_events').insert({
        submitted_code_fingerprint: submittedFingerprint,
        outcome: 'invalid',
        mobile_hash: mobileHash,
        mobile_masked: mobileMasked,
        location_status: location?.status || 'unavailable',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        ip_hash: ipHash,
        device_ua: userAgent,
        request_correlation_id: correlationId,
      });

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
      await supabase.from('verification_events').insert({
        code_id: codeRecord.id,
        submitted_code_fingerprint: submittedFingerprint,
        outcome: 'disabled',
        mobile_hash: mobileHash,
        mobile_masked: mobileMasked,
        location_status: location?.status || 'unavailable',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        ip_hash: ipHash,
        device_ua: userAgent,
        request_correlation_id: correlationId,
      });

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
      // Log the repeat attempt
      await supabase.from('verification_events').insert({
        code_id: codeRecord.id,
        submitted_code_fingerprint: submittedFingerprint,
        outcome: 'already_verified',
        mobile_hash: mobileHash,
        mobile_masked: mobileMasked,
        location_status: location?.status || 'unavailable',
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        ip_hash: ipHash,
        device_ua: userAgent,
        request_correlation_id: correlationId,
      });

      return NextResponse.json({
        outcome: 'already_verified',
        message:
          'This scratch code was previously authenticated. If you did not scratch and verify this code yourself, it may be a counterfeit.',
        firstVerifiedAt: verifiedEvent.created_at,
      });
    }

    // Case 4: Code is Active & Unconsumed -> Record successful verification event
    const nowIso = new Date().toISOString();
    await supabase.from('verification_events').insert({
      code_id: codeRecord.id,
      submitted_code_fingerprint: submittedFingerprint,
      outcome: 'verified',
      mobile_hash: mobileHash,
      mobile_masked: mobileMasked,
      location_status: location?.status || 'unavailable',
      location_lat: location?.latitude,
      location_lng: location?.longitude,
      ip_hash: ipHash,
      device_ua: userAgent,
      request_correlation_id: correlationId,
    });

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
