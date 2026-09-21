export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductCategory =
  | 'Protein'
  | 'Mass gainer'
  | 'Multivitamins'
  | 'Calcium'
  | 'Omega gold fish oil'
  | 'Creatine'
  | 'Pre-workout';

export type UserRole = 'admin' | 'super_admin';

export type CodeStatus = 'active' | 'disabled' | 'revoked';

export type VerificationOutcome =
  | 'verified'
  | 'invalid'
  | 'disabled'
  | 'already_verified'
  | 'rate_limited';

export type BatchStatus = 'pending' | 'completed' | 'failed';

export type ExportFormat = 'xls' | 'pdf';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: ProductCategory;
          price_amount: number | null;
          price_currency: string;
          description: string | null;
          specifications: Record<string, unknown>;
          nutrition_facts: Record<string, unknown>;
          is_visible: boolean;
          is_deleted: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: ProductCategory;
          price_amount?: number | null;
          price_currency?: string;
          description?: string | null;
          specifications?: Record<string, unknown>;
          nutrition_facts?: Record<string, unknown>;
          is_visible?: boolean;
          is_deleted?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: ProductCategory;
          price_amount?: number | null;
          price_currency?: string;
          description?: string | null;
          specifications?: Record<string, unknown>;
          nutrition_facts?: Record<string, unknown>;
          is_visible?: boolean;
          is_deleted?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          cloudinary_public_id: string;
          secure_url: string;
          width: number | null;
          height: number | null;
          format: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          cloudinary_public_id: string;
          secure_url: string;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          cloudinary_public_id?: string;
          secure_url?: string;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      verification_code_batches: {
        Row: {
          id: string;
          requested_count: number;
          generated_count: number;
          code_scheme: string;
          status: BatchStatus;
          actor_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          requested_count: number;
          generated_count?: number;
          code_scheme?: string;
          status?: BatchStatus;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          requested_count?: number;
          generated_count?: number;
          code_scheme?: string;
          status?: BatchStatus;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      verification_codes: {
        Row: {
          id: string;
          batch_id: string;
          code_hash: string;
          code_encrypted: string | null;
          status: CodeStatus;
          generated_at: string;
          status_changed_at: string | null;
          status_changed_by: string | null;
        };
        Insert: {
          id?: string;
          batch_id: string;
          code_hash: string;
          code_encrypted?: string | null;
          status?: CodeStatus;
          generated_at?: string;
          status_changed_at?: string | null;
          status_changed_by?: string | null;
        };
        Update: {
          id?: string;
          batch_id?: string;
          code_hash?: string;
          code_encrypted?: string | null;
          status?: CodeStatus;
          generated_at?: string;
          status_changed_at?: string | null;
          status_changed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_codes_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "verification_code_batches";
            referencedColumns: ["id"];
          }
        ];
      };
      verification_events: {
        Row: {
          id: string;
          code_id: string | null;
          submitted_code_fingerprint: string;
          outcome: VerificationOutcome;
          mobile_hash: string;
          mobile_masked: string;
          location_status: string;
          location_lat: number | null;
          location_lng: number | null;
          location_accuracy: string | null;
          device_ua: string | null;
          device_browser: string | null;
          device_os: string | null;
          device_type: string | null;
          ip_hash: string | null;
          request_correlation_id: string;
          rate_limited: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code_id?: string | null;
          submitted_code_fingerprint: string;
          outcome: VerificationOutcome;
          mobile_hash: string;
          mobile_masked: string;
          location_status?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          location_accuracy?: string | null;
          device_ua?: string | null;
          device_browser?: string | null;
          device_os?: string | null;
          device_type?: string | null;
          ip_hash?: string | null;
          request_correlation_id: string;
          rate_limited?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code_id?: string | null;
          submitted_code_fingerprint?: string;
          outcome?: VerificationOutcome;
          mobile_hash?: string;
          mobile_masked?: string;
          location_status?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          location_accuracy?: string | null;
          device_ua?: string | null;
          device_browser?: string | null;
          device_os?: string | null;
          device_type?: string | null;
          ip_hash?: string | null;
          request_correlation_id?: string;
          rate_limited?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_events_code_id_fkey";
            columns: ["code_id"];
            isOneToOne: false;
            referencedRelation: "verification_codes";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_state: Json | null;
          after_state: Json | null;
          reason: string | null;
          request_correlation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_state?: Json | null;
          after_state?: Json | null;
          reason?: string | null;
          request_correlation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_state?: Json | null;
          after_state?: Json | null;
          reason?: string | null;
          request_correlation_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      export_jobs: {
        Row: {
          id: string;
          requester_id: string;
          scope_description: string;
          filters_applied: Json;
          format: ExportFormat;
          status: ExportStatus;
          file_url: string | null;
          expires_at: string | null;
          error_details: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          scope_description: string;
          filters_applied?: Json;
          format: ExportFormat;
          status?: ExportStatus;
          file_url?: string | null;
          expires_at?: string | null;
          error_details?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          requester_id?: string;
          scope_description?: string;
          filters_applied?: Json;
          format?: ExportFormat;
          status?: ExportStatus;
          file_url?: string | null;
          expires_at?: string | null;
          error_details?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      verify_scratch_code_atomic: {
        Args: {
          p_code_hash: string;
          p_submitted_fingerprint: string;
          p_mobile_hash: string;
          p_mobile_masked: string;
          p_location_status: string;
          p_location_lat?: number;
          p_location_lng?: number;
          p_device_ua?: string;
          p_device_browser?: string;
          p_device_os?: string;
          p_device_type?: string;
          p_ip_hash?: string;
          p_correlation_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      product_category: ProductCategory;
      user_role: UserRole;
      code_status: CodeStatus;
      verification_outcome: VerificationOutcome;
      batch_status: BatchStatus;
      export_format: ExportFormat;
      export_status: ExportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
