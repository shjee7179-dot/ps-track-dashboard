export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Placeholder until Supabase-generated database types are introduced.
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          external_subject: string | null;
          email: string;
          name: string;
          affiliation: string;
          default_role: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          external_subject?: string | null;
          email: string;
          name: string;
          affiliation?: string;
          default_role: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          external_subject?: string | null;
          email?: string;
          name?: string;
          affiliation?: string;
          default_role?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_assignments: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          scope_type: string;
          scope_id: string;
          starts_at: string;
          ends_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          scope_type: string;
          scope_id: string;
          starts_at?: string;
          ends_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          scope_type?: string;
          scope_id?: string;
          starts_at?: string;
          ends_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
