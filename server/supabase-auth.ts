import { supabaseAdmin } from "./db-simple";
import bcrypt from "bcrypt";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPremium: boolean;
  points: number;
}

export class SupabaseAuth {
  // User authentication methods
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        isPremium: data.is_premium || false,
        points: data.points || 0,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        isPremium: data.is_premium || false,
        points: data.points || 0,
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthUser | null> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: userData.email,
          password: hashedPassword,
          first_name: userData.firstName,
          last_name: userData.lastName,
          points: 0,
          is_premium: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        isPremium: data.is_premium || false,
        points: data.points || 0,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async verifyPassword(user: AuthUser, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();
      
      if (error || !data?.password) return false;
      
      return await bcrypt.compare(password, data.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Admin methods
  async isAdmin(user: AuthUser): Promise<boolean> {
    return user.email === 'admin@boostbuddies.com';
  }

  // Posts methods
  async getPendingPosts(): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users(id, first_name, last_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(post => ({
        ...post,
        user: {
          firstName: post.users?.first_name || '',
          lastName: post.users?.last_name || '',
          email: post.users?.email || ''
        }
      }));
    } catch (error) {
      console.error('Error getting pending posts:', error);
      return [];
    }
  }

  async approvePost(postId: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .update({
          status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      return !error;
    } catch (error) {
      console.error('Error approving post:', error);
      return false;
    }
  }

  async rejectPost(postId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .update({
          status: 'rejected',
          approved_by: adminId,
          rejected_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      return !error;
    } catch (error) {
      console.error('Error rejecting post:', error);
      return false;
    }
  }

  // System settings methods
  async getSystemSettings(): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting system settings:', error);
      return [];
    }
  }

  async updateSystemSetting(key: string, value: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Error updating system setting:', error);
      return false;
    }
  }

  // Initialize default data
  async initializeDefaults(): Promise<void> {
    try {
      // Create default system settings
      const defaultSettings = [
        { key: 'FLUTTERWAVE_PUBLIC_KEY', value: '', description: 'Flutterwave public key', category: 'payment' },
        { key: 'FLUTTERWAVE_SECRET_KEY', value: '', description: 'Flutterwave secret key', category: 'payment' },
        { key: 'PAYSTACK_PUBLIC_KEY', value: '', description: 'Paystack public key', category: 'payment' },
        { key: 'PAYSTACK_SECRET_KEY', value: '', description: 'Paystack secret key', category: 'payment' },
        { key: 'BTC_ADDRESS', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', description: 'Bitcoin address', category: 'crypto' },
        { key: 'ETH_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'Ethereum address', category: 'crypto' },
        { key: 'USDT_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'USDT address', category: 'crypto' },
        { key: 'MATIC_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'Polygon address', category: 'crypto' },
      ];

      for (const setting of defaultSettings) {
        await supabaseAdmin
          .from('system_settings')
          .upsert(setting, { onConflict: 'key' });
      }

      // Create admin user if not exists
      const adminEmail = 'admin@boostbuddies.com';
      const existingAdmin = await this.getUserByEmail(adminEmail);
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await supabaseAdmin
          .from('users')
          .insert({
            email: adminEmail,
            password: hashedPassword,
            first_name: 'Admin',
            last_name: 'User',
            points: 0,
            is_premium: true,
          });
          
        console.log('✅ Admin user created: admin@boostbuddies.com / admin123');
      }

      console.log('✅ Default data initialized');
    } catch (error) {
      console.error('❌ Failed to initialize defaults:', error);
    }
  }
}

export const supabaseAuth = new SupabaseAuth();