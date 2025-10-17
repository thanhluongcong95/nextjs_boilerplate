/**
 * Mock data cho authentication và các API khác
 *
 * File này chứa tất cả mock data để test ứng dụng mà không cần backend thật
 */

// Mock users database
export const mockUsers = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    status: 'active',
    createdAt: '2024-01-15T08:30:00Z',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    status: 'active',
    createdAt: '2024-01-20T10:15:00Z',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    status: 'inactive',
    createdAt: '2024-02-01T14:45:00Z',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    status: 'active',
    createdAt: '2024-02-10T09:20:00Z',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    status: 'active',
    createdAt: '2024-02-15T11:00:00Z',
  },
];

// Mock products database
export const mockProducts = [
  {
    id: '1',
    name: 'Laptop Dell XPS 15',
    price: 35000000,
    inventory: 15,
    status: 'published',
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    price: 32000000,
    inventory: 25,
    status: 'published',
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra',
    price: 28000000,
    inventory: 30,
    status: 'published',
  },
  {
    id: '4',
    name: 'MacBook Pro M3',
    price: 45000000,
    inventory: 8,
    status: 'published',
  },
  {
    id: '5',
    name: 'iPad Pro 12.9 inch',
    price: 25000000,
    inventory: 12,
    status: 'published',
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    price: 8000000,
    inventory: 40,
    status: 'published',
  },
  {
    id: '7',
    name: 'Apple Watch Ultra 2',
    price: 21000000,
    inventory: 5,
    status: 'draft',
  },
  {
    id: '8',
    name: 'Dell Monitor 27 inch',
    price: 6000000,
    inventory: 0,
    status: 'archived',
  },
];

// Valid login credentials
export const validCredentials = [
  { email: 'admin@example.com', password: 'password123', role: 'admin' },
  { email: 'user@example.com', password: 'password123', role: 'user' },
];

// Mock user profile data
export const mockUserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@example.com',
  name: 'Admin User',
  avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff',
  role: 'admin' as const,
};

// Simulate network delay
export const simulateDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Generate mock JWT token
export const generateMockToken = () =>
  `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
