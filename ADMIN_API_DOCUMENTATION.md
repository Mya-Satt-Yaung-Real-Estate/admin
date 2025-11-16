# Admin API Documentation

## Overview

This document provides comprehensive API documentation for the Admin Panel. All endpoints require authentication using Laravel Sanctum tokens.

**Base URL:** `https://msy-api.phyozaw.info/api/v1/admin`

**Authentication:** Bearer Token (Laravel Sanctum)

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // Only for paginated responses
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

### Pagination Format
```json
{
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 100,
    "last_page": 10,
    "from": 1,
    "to": 10,
    "has_more_pages": true
  }
}
```

## Property Management Overview

### Dual-Mode Property Creation

The admin panel supports two modes for property creation and management:

#### **Mode 1: Platform Properties**
- **Purpose**: Admin creates properties owned by the platform
- **Point System**: No points deducted from any account
- **Ownership**: Property owned by admin user (user_type = 'admin')
- **Use Case**: Featured properties, promotional listings, platform showcase

#### **Mode 2: User Properties**
- **Purpose**: Admin creates properties on behalf of users
- **Point System**: Points deducted from the specified user's account
- **Ownership**: Property owned by individual/company user
- **Use Case**: Assisting users with property uploads, customer service

### Point System Integration

#### **Point Costs**
- **Property Upload**: 10 points (when status = 'published')
- **Property Upgrade**: 10 points (when changing from 'draft' to 'published')

#### **Point Validation**
- System validates user has sufficient points before creating/updating properties
- Points are deducted from user's account, not admin's account
- Detailed error messages include user information and point requirements

#### **Property Type Detection**
- **Platform Property**: `user.user_type === 'admin'`
- **User Property**: `user.user_type === 'individual'` or `'company'`

### Property Update Behavior

#### **Automatic Mode Detection**
- System automatically detects property type during updates
- No need to specify `is_platform_property` or `user_id` in update requests
- Property type cannot be changed during updates

#### **Point Deduction Logic**
- **Platform Properties**: Never deduct points
- **User Properties**: Deduct points only when changing status to 'published'
- **Status Changes**: Draft → Published (requires points), Published → Draft (no points)

### User Types and Permissions

#### **Admin Users (user_type = 'admin')**
- Can create platform properties (no points required)
- Can create properties on behalf of users (points deducted from user)
- Can update any property (automatic mode detection)
- Full system access

#### **Individual Users (user_type = 'individual')**
- Can own properties (points deducted when publishing)
- Can have properties created by admin on their behalf
- Standard user permissions

#### **Company Users (user_type = 'company')**
- Can own properties (points deducted when publishing)
- Can have properties created by admin on their behalf
- Enhanced features for business users

### Error Handling

#### **Insufficient Points Error**
```json
{
  "success": false,
  "message": "Insufficient points for this action",
  "required_points": 10,
  "current_balance": 5,
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

#### **Validation Errors**
- Clear error messages for missing required fields
- Specific validation for user_id when creating user properties
- Property type validation during updates

## Authentication

### Login
**POST** `/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "slug": "admin-user",
      "email": "admin@example.com",
      "user_type": "admin",
      "member_level": "silver",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "is_admin": true,
      "roles": [
        {
          "id": 1,
          "name": "Super Admin",
          "slug": "super-admin",
          "description": "Full system access",
          "is_active": true
        }
      ]
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Logout
**POST** `/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

## Admin Users Management

### List Admin Users
**GET** `/admin-users`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active` or `inactive`)
- `sort_by` (optional): Sort field (`name`, `email`, `created_at`, `last_login_at`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "slug": "admin-user",
      "email": "admin@example.com",
      "user_type": "admin",
      "member_level": "silver",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "is_admin": true,
      "roles": [...]
    }
  ],
  "pagination": { ... }
}
```

### Create Admin User
**POST** `/admin-users`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "user_type": "admin",
  "is_active": true,
  "role_ids": [1, 2],
  "member_level": "silver"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "New Admin",
      "slug": "new-admin",
      "email": "newadmin@example.com",
      "user_type": "admin",
      "member_level": "silver",
      "is_active": true,
      "roles": [...]
    }
  }
}
```

### Get Admin User
**GET** `/admin-users/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "slug": "admin-user",
      "email": "admin@example.com",
      "user_type": "admin",
      "member_level": "silver",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "is_admin": true,
      "roles": [...],
      "permissions": [...]
    }
  }
}
```

### Update Admin User
**PUT** `/admin-users/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Updated Admin",
  "email": "updated@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "user_type": "admin",
  "is_active": true,
  "role_ids": [1],
  "member_level": "gold"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user updated successfully",
  "data": {
    "data": {
      "id": 1,
      "name": "Updated Admin",
      "slug": "updated-admin",
      "email": "updated@example.com",
      "user_type": "admin",
      "member_level": "gold",
      "is_active": true,
      "roles": [...]
    }
  }
}
```

### Delete Admin User
**DELETE** `/admin-users/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Admin user deleted successfully",
  "data": null
}
```

## Frontend Users Management

### List Frontend Users
**GET** `/users`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `user_type` (optional): Filter by user type (`individual` or `company`)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active` or `inactive`)
- `member_level` (optional): Filter by member level (`bronze`, `silver`, `gold`, `platinum`)
- `point_balance_min` (optional): Minimum point balance filter
- `point_balance_max` (optional): Maximum point balance filter
- `property_count_min` (optional): Minimum property count filter
- `property_count_max` (optional): Maximum property count filter
- `sort_by` (optional): Sort field (`name`, `email`, `created_at`, `last_login_at`, `point_balance`, `property_count`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "slug": "john-doe",
      "email": "john@example.com",
      "user_type": "individual",
      "member_level": "silver",
      "is_active": true,
      "property_count": 5,
      "point_balance": 150,
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "slug": "jane-smith",
      "email": "jane@company.com",
      "user_type": "company",
      "member_level": "gold",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "company_profile": {
        "id": 1,
        "company_name": "ABC Real Estate",
        "company_type_id": 1,
        "company_type_name": "Real Estate Agency(အိမ်ခြံမြေအေဂျင်စီ)",
        "phone_number": "+959123456789",
        "address": "123 Business Street",
        "website": "https://abcrealestate.com",
        "description": "Professional real estate services",
        "view_count": 150,
        "location_en": "Yangon,Sanchaung",
        "location_mm": "ရန်ကုန်,စမ်းချောင်း"
      },
      "property_count": 12,
      "point_balance": 250,
      "total_points_allocated": 800,
      "total_points_consumed": 550,
      "point_packages_count": 5
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5,
    "from": 1,
    "to": 10,
    "has_more_pages": true
  }
}
```

### Get Frontend User Details
**GET** `/users/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "slug": "john-doe",
      "email": "john@example.com",
      "user_type": "individual",
      "member_level": "silver",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "property_count": 5,
      "point_balance": 150,
      "total_points_allocated": 500,
      "total_points_consumed": 350,
      "point_packages": [
        {
          "id": 1,
          "package_name": "Premium Package",
          "points_allocated": 300,
          "points_remaining": 150,
          "points_consumed": 150,
          "consumption_percentage": 50.0,
          "allocated_at": "2024-01-15T10:30:00.000000Z",
          "expires_at": "2025-01-15T10:30:00.000000Z",
          "days_until_expiry": 45,
          "is_expired": false,
          "is_active": true,
          "allocated_by": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com"
          }
        }
      ],
      "recent_transactions": [
        {
          "id": 1,
          "transaction_type": "DEBIT",
          "points_amount": 10,
          "balance_before": 160,
          "balance_after": 150,
          "reference_type": "property_upload",
          "reference_id": 123,
          "description": "Property upload fee",
          "created_at": "2024-01-20T14:30:00.000000Z"
        }
      ]
    }
  }
}
```

**Company User Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "slug": "jane-smith",
      "email": "jane@company.com",
      "user_type": "company",
      "member_level": "gold",
      "is_active": true,
      "last_login_at": "2024-01-15T10:30:00.000000Z",
      "last_active_at": "2024-01-15T10:30:00.000000Z",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "company_profile": {
        "id": 1,
        "company_name": "ABC Real Estate",
        "company_type_id": 1,
        "company_type_name": "Real Estate Agency(အိမ်ခြံမြေအေဂျင်စီ)",
        "phone_number": "+959123456789",
        "address": "123 Business Street",
        "website": "https://abcrealestate.com",
        "description": "Professional real estate services",
        "view_count": 150,
        "location_en": "Yangon,Sanchaung",
        "location_mm": "ရန်ကုန်,စမ်းချောင်း"
      },
      "property_count": 12,
      "point_balance": 250,
      "total_points_allocated": 1000,
      "total_points_consumed": 750,
      "point_packages": [
        {
          "id": 2,
          "package_name": "Business Package",
          "points_allocated": 500,
          "points_remaining": 250,
          "points_consumed": 250,
          "consumption_percentage": 50.0,
          "allocated_at": "2024-01-10T10:30:00.000000Z",
          "expires_at": "2025-01-10T10:30:00.000000Z",
          "days_until_expiry": 40,
          "is_expired": false,
          "is_active": true,
          "allocated_by": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com"
          }
        }
      ],
      "recent_transactions": [
        {
          "id": 3,
          "transaction_type": "DEBIT",
          "points_amount": 25,
          "balance_before": 275,
          "balance_after": 250,
          "reference_type": "featured_property",
          "reference_id": 456,
          "description": "Featured property upgrade",
          "created_at": "2024-01-20T14:30:00.000000Z"
        }
      ]
    }
  }
}
```

### Update Frontend User Status
**PUT** `/users/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "slug": "john-doe",
      "email": "john@example.com",
      "user_type": "individual",
      "member_level": "silver",
      "is_active": false,
      "property_count": 5,
      "point_balance": 150
    }
  }
}
```

## Property Management

### List All Properties
**GET** `/properties`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by title, description, or address
- `user_type` (optional): Filter by property owner type (`admin`, `individual`, `company`)
- `status` (optional): Filter by status (`draft`, `published`, `sold`, `rented`)
- `verification_status` (optional): Filter by verification status (`pending`, `approved`, `rejected`)
- `property_type_id` (optional): Filter by property type
- `listing_type_id` (optional): Filter by listing type
- `region_id` (optional): Filter by region
- `township_id` (optional): Filter by township
- `price_min` (optional): Minimum price filter
- `price_max` (optional): Maximum price filter
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `sort_by` (optional): Sort field (`created_at`, `updated_at`, `price`, `area_sqft`, `title_en`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": [
    {
            "id": 2,
            "user_id": 7,
            "user": {
                "id": 7,
                "name": "Yangon Properties",
                "slug": "yangon-properties",
                "email": "contact@yangonproperties.com",
                "user_type": "company",
                "member_level": "silver",
                "is_active": true,
                "company_profile": {
                    "id": 2,
                    "company_name": "Yangon Properties Ltd.",
                    "company_type_id": 2,
                    "company_type_name": "Construction Company(ဆောက်လုပ်ရေးကုမ္ပဏီ)",
                    "phone_number": "+959987654321",
                    "address": "Building A, Downtown Business Center",
                    "website": null,
                    "description": "Comprehensive property solutions for Yangon area",
                    "view_count": 0,
                    "location_en": "Mandalay,Amarapura",
                    "location_mm": "မန္တလေး,အမရပူရ"
                }
            },
            "property_type": {
                "id": 1,
                "name": "House(အိမ်)",
                "slug": "house"
            },
            "listing_type": {
                "id": 1,
                "name": "For Sale(ရောင်းရန်)",
                "slug": "for-sale"
            },
            "title_en": "Luxury Villa in Mandalay",
            "title_mm": "မန္တလေးမှာ ဇိမ်ခံအိမ်ကြီး",
            "description": "Exclusive luxury villa with premium finishes and amenities. Features include a swimming pool, home theater, and smart home automation. Located in the most prestigious area of Mandalay.",
            "property_condition": "new",
            "location": {
                "region": {
                    "id": 2,
                    "name": "Mandalay(မန္တလေး)"
                },
                "township": {
                    "id": 14,
                    "name_en": "Pyigyidagun(ပြည်ကြီးတံခွန်)"
                },
                "address": "No. 177, Residential Lane, Pyigyidagun, Mandalay",
                "latitude": "22.06400000",
                "longitude": "96.18400000",
                "location": "Pyigyidagun, Mandalay(ပြည်ကြီးတံခွန်, မန္တလေး)"
            },
            "price": "1200000000.00",
            "formatted_price": "1,200,000,000 MMK",
            "area_sqft": "4000.00",
            "bedrooms": 5,
            "bathrooms": 4,
            "bank_installment_available": true,
            "features": [
                "swimming_pool",
                "home_theater",
                "smart_home",
                "garden",
                "parking"
            ],
            "contact_info": {
                "owner_name": "Daw Su Su Win",
                "phone_numbers": [
                    "+959555123456"
                ],
                "email": "su.su.win@example.com"
            },
            "status": "published",
            "is_featured": false,
            "stats": {
                "view_count": 0,
                "contact_count": 0,
                "favorite_count": 1
            },
            "dates": {
                "published_at": "2025-08-16T01:05:31.000000Z",
                "expires_at": "2025-09-19T10:49:46.000000Z",
                "created_at": "2025-08-16T01:05:31.000000Z",
                "verified_at": "2025-08-16T01:05:31.000000Z"
            },
            "verification_status": "approved",
            "rejection_reason": null,
            "verified_by": {
                "id": 1,
                "name": "Aung Min"
            },
            "is_published": true,
            "is_draft": false,
            "is_sold": false,
            "is_rented": false,
            "is_expired": false,
            "can_be_published": false,
            "is_approved": true,
            "is_pending_approval": false,
            "is_rejected": false,
            "is_deleted": false,
            "media": {
                "images": [
                    {
                        "id": 6,
                        "type": "image",
                        "filename": "h6.jpg",
                        "is_primary": true,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e1ab141.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e197c8f_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e1a302b_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e18a051_thumbnail.jpg"
                    },
                    {
                        "id": 7,
                        "type": "image",
                        "filename": "h7.jpg",
                        "is_primary": false,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75eb3d2ad.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75eb2b873_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75eb347e3_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75eb1f8b0_thumbnail.jpg"
                    },
                ],
                "videos": [],
                "primary_image": {
                    "id": 6,
                    "type": "image",
                    "filename": "h6.jpg",
                    "is_primary": true,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e1ab141.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e197c8f_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e1a302b_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f75e18a051_thumbnail.jpg"
                }
            }
        },
        {
            "id": 3,
            "user_id": 7,
            "user": {
                "id": 7,
                "name": "Yangon Properties",
                "slug": "yangon-properties",
                "email": "contact@yangonproperties.com",
                "user_type": "company",
                "member_level": "silver",
                "is_active": true,
                "company_profile": {
                    "id": 2,
                    "company_name": "Yangon Properties Ltd.",
                    "company_type_id": 2,
                    "company_type_name": "Construction Company(ဆောက်လုပ်ရေးကုမ္ပဏီ)",
                    "phone_number": "+959987654321",
                    "address": "Building A, Downtown Business Center",
                    "website": null,
                    "description": "Comprehensive property solutions for Yangon area",
                    "view_count": 0,
                    "location_en": "Mandalay,Amarapura",
                    "location_mm": "မန္တလေး,အမရပူရ"
                }
            },
            "property_type": {
                "id": 2,
                "name": "Apartment(တိုက်ခန်း)",
                "slug": "apartment"
            },
            "listing_type": {
                "id": 2,
                "name": "For Rent(ငှားရန်)",
                "slug": "for-rent"
            },
            "title_en": "Modern Apartment for Rent in Downtown",
            "title_mm": "မြို့လယ်မှာ ခေတ်မီတိုက်ခန်း ငှားရန်",
            "description": "Fully furnished modern apartment in the heart of downtown. Perfect for professionals or small families. Includes all utilities, 24/7 security, and access to gym and pool facilities.",
            "property_condition": "good",
            "location": {
                "region": {
                    "id": 1,
                    "name": "Yangon(ရန်ကုန်)"
                },
                "township": {
                    "id": 1,
                    "name_en": "Downtown(မြို့ပြ)"
                },
                "address": "No. 43, Business Street, Downtown, Yangon",
                "latitude": "16.89400000",
                "longitude": "96.25800000",
                "location": "Downtown, Yangon(မြို့ပြ, ရန်ကုန်)"
            },
            "price": "2500000.00",
            "formatted_price": "2,500,000 MMK",
            "area_sqft": "1200.00",
            "bedrooms": 2,
            "bathrooms": 2,
            "bank_installment_available": false,
            "features": [
                "furnished",
                "gym",
                "pool",
                "security",
                "parking"
            ],
            "contact_info": {
                "owner_name": "U Kyaw Zin",
                "phone_numbers": [
                    "+959777888999"
                ],
                "email": "kyaw.zin@example.com"
            },
            "status": "published",
            "is_featured": false,
            "stats": {
                "view_count": 0,
                "contact_count": 0,
                "favorite_count": 1
            },
            "dates": {
                "published_at": "2025-08-16T01:05:31.000000Z",
                "expires_at": "2025-08-27T02:05:04.000000Z",
                "created_at": "2025-08-16T01:05:31.000000Z",
                "verified_at": "2025-08-16T01:05:31.000000Z"
            },
            "verification_status": "approved",
            "rejection_reason": null,
            "verified_by": {
                "id": 1,
                "name": "Aung Min"
            },
            "is_published": true,
            "is_draft": false,
            "is_sold": false,
            "is_rented": false,
            "is_expired": false,
            "can_be_published": false,
            "is_approved": true,
            "is_pending_approval": false,
            "is_rejected": false,
            "media": {
                "images": [
                    {
                        "id": 11,
                        "type": "image",
                        "filename": "h11.jpg",
                        "is_primary": true,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761009c29.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fe71da_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760feff59_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fdac6a_thumbnail.jpg"
                    },
                    {
                        "id": 12,
                        "type": "image",
                        "filename": "h12.jpg",
                        "is_primary": false,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761b02694.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761ae40c3_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761aed563_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761ad8fb2_thumbnail.jpg"
                    },
                ],
                "videos": [
                    {
                        "id": 15,
                        "type": "video",
                        "filename": "SampleVideo_1280x720_30mb.mp4",
                        "is_primary": false,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f7689d29a3.mp4",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f76893f4be_small.mp4",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f76898786d_medium.mp4",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f7688f2b33_thumbnail.mp4",
                        "video_info": {
                            "duration": 170,
                            "resolution": "1280x720",
                            "format": "mp4",
                            "bitrate": 1474,
                            "thumbnail_timestamp": null
                        }
                    }
                ],
                "primary_image": {
                    "id": 11,
                    "type": "image",
                    "filename": "h11.jpg",
                    "is_primary": true,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761009c29.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fe71da_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760feff59_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fdac6a_thumbnail.jpg"
                }
            }
        }

  ],
  "pagination": { ... }
}
```

### List Pending Properties
**GET** `/properties/pending`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as list properties

**Response:** Same format as list properties, but only pending properties

### List Published Properties
**GET** `/properties/published`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as list properties

**Response:** Same format as list properties, but only published properties

### Get Property Details
**GET** `/properties/{id}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Property retrieved successfully",
  "data": {
    "id": 3,
        "user_id": 7,
        "user": {
            "id": 7,
            "name": "Yangon Properties",
            "slug": "yangon-properties",
            "email": "contact@yangonproperties.com",
            "user_type": "company",
            "member_level": "silver",
            "is_active": true,
            "company_profile": {
                "id": 2,
                "company_name": "Yangon Properties Ltd.",
                "company_type_id": 2,
                "company_type_name": "Construction Company(ဆောက်လုပ်ရေးကုမ္ပဏီ)",
                "phone_number": "+959987654321",
                "address": "Building A, Downtown Business Center",
                "website": null,
                "description": "Comprehensive property solutions for Yangon area",
                "view_count": 0,
                "location_en": "Mandalay,Amarapura",
                "location_mm": "မန္တလေး,အမရပူရ"
            }
        },
        "property_type": {
            "id": 2,
            "name": "Apartment(တိုက်ခန်း)",
            "slug": "apartment"
        },
        "listing_type": {
            "id": 2,
            "name": "For Rent(ငှားရန်)",
            "slug": "for-rent"
        },
        "title_en": "Modern Apartment for Rent in Downtown",
        "title_mm": "မြို့လယ်မှာ ခေတ်မီတိုက်ခန်း ငှားရန်",
        "description": "Fully furnished modern apartment in the heart of downtown. Perfect for professionals or small families. Includes all utilities, 24/7 security, and access to gym and pool facilities.",
        "property_condition": "good",
        "location": {
            "region": {
                "id": 1,
                "name": "Yangon(ရန်ကုန်)"
            },
            "township": {
                "id": 1,
                "name_en": "Downtown(မြို့ပြ)"
            },
            "address": "No. 43, Business Street, Downtown, Yangon",
            "latitude": "16.89400000",
            "longitude": "96.25800000",
            "location": "Downtown, Yangon(မြို့ပြ, ရန်ကုန်)"
        },
        "price": "2500000.00",
        "formatted_price": "2,500,000 MMK",
        "area_sqft": "1200.00",
        "bedrooms": 2,
        "bathrooms": 2,
        "bank_installment_available": false,
        "features": [
            "furnished",
            "gym",
            "pool",
            "security",
            "parking"
        ],
        "contact_info": {
            "owner_name": "U Kyaw Zin",
            "phone_numbers": [
                "+959777888999"
            ],
            "email": "kyaw.zin@example.com"
        },
        "status": "published",
        "is_featured": false,
        "stats": {
            "view_count": 0,
            "contact_count": 0,
            "favorite_count": 1
        },
        "dates": {
            "published_at": "2025-08-16T01:05:31.000000Z",
            "expires_at": "2025-08-27T02:05:04.000000Z",
            "created_at": "2025-08-16T01:05:31.000000Z",
            "verified_at": "2025-08-16T01:05:31.000000Z"
        },
        "verification_status": "approved",
        "rejection_reason": null,
        "verified_by": {
            "id": 1,
            "name": "Aung Min"
        },
        "is_published": true,
        "is_draft": false,
        "is_sold": false,
        "is_rented": false,
        "is_expired": false,
        "can_be_published": false,
        "is_approved": true,
        "is_pending_approval": false,
        "is_rejected": false,
        "media": {
            "images": [
                {
                    "id": 11,
                    "type": "image",
                    "filename": "h11.jpg",
                    "is_primary": true,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761009c29.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fe71da_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760feff59_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fdac6a_thumbnail.jpg"
                },
                {
                    "id": 12,
                    "type": "image",
                    "filename": "h12.jpg",
                    "is_primary": false,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761b02694.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761ae40c3_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761aed563_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761ad8fb2_thumbnail.jpg"
                },
            ],
            "videos": [
                {
                    "id": 15,
                    "type": "video",
                    "filename": "SampleVideo_1280x720_30mb.mp4",
                    "is_primary": false,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f7689d29a3.mp4",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f76893f4be_small.mp4",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f76898786d_medium.mp4",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/videos/2025/08/15/689f7688f2b33_thumbnail.mp4",
                    "video_info": {
                        "duration": 170,
                        "resolution": "1280x720",
                        "format": "mp4",
                        "bitrate": 1474,
                        "thumbnail_timestamp": null
                    }
                }
            ],
            "primary_image": {
                "id": 11,
                "type": "image",
                "filename": "h11.jpg",
                "is_primary": true,
                "status": "completed",
                "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f761009c29.jpg",
                "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fe71da_small.jpg",
                "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760feff59_medium.jpg",
                "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/15/689f760fdac6a_thumbnail.jpg"
            }
        }
  }
}
```

### Create Property (Dual Mode)

**POST** `/properties`

**Headers:** `Authorization: Bearer {token}`

#### **Mode 1: Platform Property (No Points Deducted)**
```json
{
  "is_platform_property": true,
  "property_type_id": 1,
  "listing_type_id": 1,
  "title_en": "Platform Featured Property",
  "title_mm": "ပလပ်ဖောင်း ထူးခြားသော အိမ်",
  "description": "A featured platform property",
  "property_condition": "new",
  "region_id": 1,
  "township_id": 1,
  "address": "456 Platform Street",
  "latitude": 16.8661,
  "longitude": 96.1951,
  "price": 800000,
  "area_sqft": 2500,
  "bedrooms": 4,
  "bathrooms": 3,
  "bank_installment_available": true,
  "features": ["garden", "parking", "security", "swimming_pool"],
  "owner_name": "Platform Admin",
  "phone_numbers": ["+959123456789"],
  "email": "platform@example.com",
  "status": "published",
  "is_featured": true,
  "is_verified": true,
  "published_at": "2024-01-15T10:30:00.000000Z",
  "expires_at": "2024-02-15T10:30:00.000000Z",
  "media_ids": [1, 2, 3, 4, 5]
}
```

#### **Mode 2: User Property (Points Deducted from User)**
```json
{
  "is_platform_property": false,
  "user_id": 123,
  "property_type_id": 1,
  "listing_type_id": 1,
  "title_en": "User Property",
  "title_mm": "အသုံးပြုသူ အိမ်",
  "description": "A property created on behalf of user",
  "property_condition": "good",
  "region_id": 1,
  "township_id": 1,
  "address": "789 User Street",
  "latitude": 16.8661,
  "longitude": 96.1951,
  "price": 600000,
  "area_sqft": 2000,
  "bedrooms": 3,
  "bathrooms": 2,
  "bank_installment_available": false,
  "features": ["garden", "parking"],
  "owner_name": "John Doe",
  "phone_numbers": ["+959987654321"],
  "email": "john@example.com",
  "status": "published",
  "is_featured": false,
  "is_verified": true,
  "published_at": "2024-01-15T10:30:00.000000Z",
  "expires_at": "2024-02-15T10:30:00.000000Z",
  "media_ids": [6, 7, 8]
}
```

**Response Examples:**

#### **Platform Property Success**
```json
{
  "success": true,
  "message": "Platform property created successfully",
  "data": {
    "id": 2,
    "title_en": "Platform Featured Property",
    "title_mm": "ပလပ်ဖောင်း ထူးခြားသော အိမ်",
    "description": "A featured platform property",
    "price": 800000,
    "area_sqft": 2500,
    "bedrooms": 4,
    "bathrooms": 3,
    "property_condition": "new",
    "status": "published",
    "verification_status": "pending",
    "is_featured": true,
    "is_verified": true,
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "user_type": "admin"
    },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

#### **User Property Success**
```json
{
  "success": true,
  "message": "Property created successfully on behalf of user",
  "data": {
    "id": 3,
    "title_en": "User Property",
    "title_mm": "အသုံးပြုသူ အိမ်",
    "description": "A property created on behalf of user",
    "price": 600000,
    "area_sqft": 2000,
    "bedrooms": 3,
    "bathrooms": 2,
    "property_condition": "good",
    "status": "published",
    "verification_status": "pending",
    "is_featured": false,
    "is_verified": true,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "user_type": "individual"
    },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

#### **Insufficient Points Error**
```json
{
  "success": false,
  "message": "Insufficient points for this action",
  "required_points": 10,
  "current_balance": 5,
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

### Update Property (Automatic Mode Detection)

**PUT** `/properties/{id}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title_en": "Updated Property Title",
  "title_mm": "အပ်ဒိတ်အိမ်ခေါင်းစဉ်",
  "description": "Updated property description",
  "price": 750000,
  "area_sqft": 2200,
  "bedrooms": 4,
  "bathrooms": 3,
  "status": "published",
  "is_featured": true,
  "media_ids": [1, 2, 3, 4, 5]
}
```

**Note:** No need to specify `is_platform_property` or `user_id` - system automatically detects property type!

**Response Examples:**

#### **Platform Property Update**
```json
{
  "success": true,
  "message": "Platform property updated successfully",
  "data": {
    "id": 1,
    "title_en": "Updated Platform Property",
    "title_mm": "အပ်ဒိတ်ပလပ်ဖောင်း အိမ်",
    "description": "Updated platform property description",
    "price": 750000,
    "area_sqft": 2200,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "published",
    "is_featured": true,
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "user_type": "admin"
    },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

#### **User Property Update (Points Deducted if Publishing)**
```json
{
  "success": true,
  "message": "Property updated successfully on behalf of user",
  "data": {
    "id": 2,
    "title_en": "Updated User Property",
    "title_mm": "အပ်ဒိတ်အသုံးပြုသူ အိမ်",
    "description": "Updated user property description",
    "price": 750000,
    "area_sqft": 2200,
    "bedrooms": 4,
    "bathrooms": 3,
    "status": "published",
    "is_featured": true,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "user_type": "individual"
    },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

### Delete Property
**DELETE** `/properties/{id}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": null
}
```

### Restore Property
**POST** `/properties/{id}/restore`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Property restored successfully",
  "data": {
    "id": 1,
    "title_en": "Restored Property",
    "title_mm": "ပြန်လည်ထည့်သွင်းထားသော အိမ်",
    "status": "draft",
    "verification_status": "pending",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### Approve/Reject Property
**POST** `/properties/{id}/verification`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "action": "approve"
}
```

**Or for rejection:**
```json
{
  "action": "reject",
  "reason": "Property does not meet requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property approved successfully",
  "data": {
    "id": 1,
    "title_en": "Beautiful House",
    "title_mm": "လှပတဲ့ အိမ်",
    "verification_status": "approved",
    "verified_by": 1,
    "verified_at": "2024-01-15T10:30:00.000000Z",
    "user": { ... },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

## File Upload Management

### Image or video upload
**POST** `/media`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "file": // Image with multipart form,
  "media_type": 'image'
}
```

**Or for video:**
```json
{
  "file": // video with multipart form,
  "media_type": 'video'
}
```

**Response:**
```json
{
    "success": true,
    "message": "Media uploaded successfully",
    "data": {
        "id": 5,
        "type": "image",
        "filename": "SampleJPGImage_10mbmb.jpg",
        "size": 10506316,
        "formatted_size": "10.02 MB",
        "mime_type": "image/jpeg",
        "is_primary": null,
        "status": "uploading",
        "url": "https://msy-demo.s3.ap-southeast-1.amazonaws.com/temp/images/2025-08-10-17-36-08_0xw35SZWyeQt.jpg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYGSAGSQLQMB567PR%2F20250810%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20250810T173611Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Signature=e3ae2cfbe4f5e7fbde8789d26de4e6a887411af6da9d447b0bb37d0654b33140",
        "created_at": "2025-08-10T17:36:11.000000Z"
    }
}
```

### Image or video delete
**POST** `/media/{media_id}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "message": "Media deleted successfully",
}
```

## Region Management

### List Regions
**GET** `/region`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by name (English or Myanmar)
- `sort_by` (optional): Sort field (default: `created_at`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Region list fetched successfully.",
  "data": [
    {
      "id": 1,
      "name_mm": "ရန်ကုန်",
      "name_en": "Yangon",
      "slug": "yangon",
      "description": "Yangon Region",
      "is_active": true,
      "townships": [
        {
          "id": 1,
          "name_mm": "မြို့လယ်",
          "name_en": "Downtown",
          "slug": "downtown",
          "is_active": true
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### Create Region
**POST** `/region`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_mm": "မန္တလေး",
  "name_en": "Mandalay",
  "description": "Mandalay Region"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Region created successfully.",
  "data": {
    "id": 2,
    "name_mm": "မန္တလေး",
    "name_en": "Mandalay",
    "slug": "mandalay",
    "description": "Mandalay Region",
    "is_active": true,
    "townships": []
  }
}
```

### Get Region
**GET** `/region/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Region
**PUT** `/region/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Region
**DELETE** `/region/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Region deleted successfully",
  "data": null
}
```

## Township Management

### List Townships
**GET** `/township`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
  "success": true,
  "message": "Township list fetched successfully.",
  "data": [
    {
      "id": 1,
      "region_id": 1,
      "name_mm": "မြို့လယ်",
      "name_en": "Downtown",
      "slug": "downtown",
      "is_active": true,
      "region": {
        "id": 1,
        "name_mm": "ရန်ကုန်",
        "name_en": "Yangon",
        "slug": "yangon"
      }
    }
  ],
  "pagination": { ... }
}
```

### Create Township
**POST** `/township`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "region_id": 1,
  "name_mm": "ဗဟန်း",
  "name_en": "Bahan",
  "description": "Bahan Township"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Township created successfully.",
  "data": {
    "id": 2,
    "region_id": 1,
    "name_mm": "ဗဟန်း",
    "name_en": "Bahan",
    "slug": "bahan",
    "is_active": true,
    "region": {
      "id": 1,
      "name_mm": "ရန်ကုန်",
      "name_en": "Yangon",
      "slug": "yangon"
    }
  }
}
```

### Get Township
**GET** `/township/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Township
**PUT** `/township/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Township
**DELETE** `/township/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Township deleted successfully",
  "data": null
}
```

## Property Type Management

### List Property Types
**GET** `/property-type`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
  "success": true,
  "message": "PropertyType list fetched successfully.",
  "data": [
    {
      "id": 1,
      "name_mm": "အိမ်",
      "name_en": "House",
      "slug": "house",
      "description": "Residential house",
      "is_active": true
    }
  ],
  "pagination": { ... }
}
```

### Create Property Type
**POST** `/property-type`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_mm": "ခန်းများ",
  "name_en": "Apartment",
  "description": "Apartment units"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PropertyType created successfully.",
  "data": {
    "id": 2,
    "name_mm": "ခန်းများ",
    "name_en": "Apartment",
    "slug": "apartment",
    "description": "Apartment units",
    "is_active": true
  }
}
```

### Get Property Type
**GET** `/property-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Property Type
**PUT** `/property-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Property Type
**DELETE** `/property-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "PropertyType deleted successfully",
  "data": null
}
```

## Property Listing Type Management

### List Property Listing Types
**GET** `/property-listing-type`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
  "success": true,
  "message": "PropertyListingType list fetched successfully.",
  "data": [
    {
      "id": 1,
      "name_mm": "ရောင်းရန်",
      "name_en": "For Sale",
      "slug": "for-sale",
      "description": "Properties for sale",
      "is_active": true,
      "sort_order": 1
    }
  ],
  "pagination": { ... }
}
```

### Create Property Listing Type
**POST** `/property-listing-type`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_mm": "ငှားရန်",
  "name_en": "For Rent",
  "description": "Properties for rent",
  "sort_order": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "PropertyListingType created successfully.",
  "data": {
    "id": 2,
    "name_mm": "ငှားရန်",
    "name_en": "For Rent",
    "slug": "for-rent",
    "description": "Properties for rent",
    "is_active": true,
    "sort_order": 2
  }
}
```

### Get Property Listing Type
**GET** `/property-listing-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Property Listing Type
**PUT** `/property-listing-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Property Listing Type
**DELETE** `/property-listing-type/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "PropertyListingType deleted successfully",
  "data": null
}
```

## Role Management

### List Roles
**GET** `/role`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
  "success": true,
  "message": "Role list fetched successfully.",
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "slug": "super-admin",
      "description": "Full system access",
      "is_active": true,
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00",
      "permissions": [
        {
          "id": 1,
          "name": "user.create",
          "slug": "user-create",
          "module": "user",
          "description": "Create users",
          "is_active": true
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### Create Role
**POST** `/role`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Content Manager",
  "description": "Manage content and properties",
  "is_active": true,
  "permissions": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully.",
  "data": {
    "id": 2,
    "name": "Content Manager",
    "slug": "content-manager",
    "description": "Manage content and properties",
    "is_active": true,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00",
    "permissions": [...]
  }
}
```

### Get Role
**GET** `/role/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Role
**PUT** `/role/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Role
**DELETE** `/role/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully",
  "data": null
}
```

## Company Type Management

### List Company Types
**GET** `/company-types`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (`active` or `inactive`)
- `sort_by` (optional): Sort field (`name_en`, `name_mm`, `created_at`, `updated_at`) - default: `name_en`
- `sort_direction` (optional): Sort direction (`asc` or `desc`) - default: `asc`

**Response:**
```json
{
  "success": true,
  "message": "Company types retrieved successfully",
  "data": [
    {
      "id": 1,
      "name_mm": "အိမ်ခြံမြေအကျိုးဆောင်ကုမ္ပဏီ",
      "name_en": "Real Estate Agency",
      "slug": "real-estate-agency",
      "description": "Companies that help buy, sell, and rent properties",
      "is_active": true,
      "companies_count": 5,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ]
}
```

### Create Company Type
**POST** `/company-types`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_mm": "ဘဏ်လုပ်ငန်း",
  "name_en": "Banking",
  "description": "Financial institutions and banking services",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company type created successfully",
  "data": {
    "id": 2,
    "name_mm": "ဘဏ်လုပ်ငန်း",
    "name_en": "Banking",
    "slug": "banking",
    "description": "Financial institutions and banking services",
    "is_active": true,
    "companies_count": 0,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### Get Company Type
**GET** `/company-types/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Company type retrieved successfully",
  "data": {
    "id": 1,
    "name_mm": "အိမ်ခြံမြေအကျိုးဆောင်ကုမ္ပဏီ",
    "name_en": "Real Estate Agency",
    "slug": "real-estate-agency",
    "description": "Companies that help buy, sell, and rent properties",
    "is_active": true,
    "companies_count": 5,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### Update Company Type
**PUT** `/company-types/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_mm": "အိမ်ခြံမြေအကျိုးဆောင်ကုမ္ပဏီများ",
  "name_en": "Real Estate Agencies",
  "description": "Updated description for real estate agencies",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company type updated successfully",
  "data": {
    "id": 1,
    "name_mm": "အိမ်ခြံမြေအကျိုးဆောင်ကုမ္ပဏီများ",
    "name_en": "Real Estate Agencies",
    "slug": "real-estate-agencies",
    "description": "Updated description for real estate agencies",
    "is_active": true,
    "companies_count": 5,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### Delete Company Type
**DELETE** `/company-types/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Company type deleted successfully",
  "data": null
}
```

**Note:** Company types cannot be deleted if they are being used by existing companies.

**Note:** This API returns all company types (maximum 100 records) without pagination for better performance and simpler frontend implementation.

## Point Package Management

### List Point Packages
**GET** `/point-packages`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 15)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status (`active`, `inactive`, `deleted`, `all`)
- `search` (optional): Search by name (English or Myanmar) or slug
- `sort_by` (optional): Sort field (`name_en`, `points`, `price_mmk`, `created_at`, `updated_at`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Point packages retrieved successfully",
  "data": [
    {
      "id": 1,
      "name_en": "Basic Package",
      "name_mm": "အခြေခံ ပက်ကေ့ချ်",
      "slug": "basic-package",
      "points": 100,
      "price_mmk": 5000,
      "description_en": "Basic point package for new users",
      "description_mm": "အသုံးပြုသူအသစ်များအတွက် အခြေခံ ပက်ကေ့ချ်",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "purchase_requests_count": 25,
      "user_points_count": 150
    }
  ],
  "pagination": { ... }
}
```

### Create Point Package
**POST** `/point-packages`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_en": "Premium Package",
  "name_mm": "ပရီမီယံ ပက်ကေ့ချ်",
  "points": 500,
  "price_mmk": 25000,
  "description_en": "Premium point package with bonus points",
  "description_mm": "ဘောနပ်စ်အမှတ်များပါဝင်သော ပရီမီယံ ပက်ကေ့ချ်",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Point package created successfully",
  "data": {
    "id": 2,
    "name_en": "Premium Package",
    "name_mm": "ပရီမီယံ ပက်ကေ့ချ်",
    "slug": "premium-package",
    "points": 500,
    "price_mmk": 25000,
    "description_en": "Premium point package with bonus points",
    "description_mm": "ဘောနပ်စ်အမှတ်များပါဝင်သော ပရီမီယံ ပက်ကေ့ချ်",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### Get Point Package
**GET** `/point-packages/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Point Package
**PUT** `/point-packages/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name_en": "Updated Premium Package",
  "name_mm": "အပ်ဒိတ်ပရီမီယံ ပက်ကေ့ချ်",
  "points": 600,
  "price_mmk": 30000,
  "description_en": "Updated premium package with more points",
  "description_mm": "အမှတ်များပါဝင်သော အပ်ဒိတ်ပရီမီယံ ပက်ကေ့ချ်",
  "is_active": true
}
```

**Note:** The validation now properly handles updates - if the name hasn't changed, it won't trigger a "name is already taken" error.

**Response:**
```json
{
  "success": true,
  "message": "Point package updated successfully",
  "data": {
    "id": 2,
    "name_en": "Updated Premium Package",
    "name_mm": "အပ်ဒိတ်ပရီမီယံ ပက်ကေ့ချ်",
    "slug": "updated-premium-package",
    "points": 600,
    "price_mmk": 30000,
    "description_en": "Updated premium package with more points",
    "description_mm": "အမှတ်များပါဝင်သော အပ်ဒိတ်ပရီမီယံ ပက်ကေ့ချ်",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:35:00.000000Z"
  }
}
```

### Delete Point Package (Soft Delete)
**DELETE** `/point-packages/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "deletion_reason": "Package no longer available"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Point package deleted successfully",
  "data": null
}
```

**Note:** Packages cannot be deleted if they have active users with remaining points or pending purchase requests.

### Restore Point Package
**POST** `/point-packages/{slug}/restore`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Point package restored successfully",
  "data": {
    "id": 2,
    "name_en": "Premium Pack",
    "name_mm": "ပရီမီယံ ပက်ကေ့ချ်",
    "slug": "premium-pack",
    "is_active": true,
    "deleted_at": null,
    "deleted_by": null,
    "deletion_reason": null
  }
}
```

### Permanently Delete Point Package
**DELETE** `/point-packages/{slug}/force`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Point package permanently deleted",
  "data": null
}
```

**Note:** This action is irreversible and can only be performed on packages with no historical data.

### Toggle Point Package Status
**POST** `/point-packages/{slug}/toggle-status`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Point package status toggled successfully",
  "data": {
    "id": 1,
    "name_en": "Starter Pack",
    "name_mm": "စတင်သူများအတွက် ပက်ကေ့ချ်",
    "slug": "starter-pack",
    "is_active": false,
    "is_available": false
  }
}
```

## Point Purchase Request Management

### List Point Purchase Requests
**GET** `/point-purchase-requests`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`, `cancelled`)
- `payment_method` (optional): Filter by payment method
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `sort_by` (optional): Sort field (`created_at`, `requested_at`, `price_mmk`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Purchase requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "pending",
      "status_label": "Pending",
      "payment_method": "bank_transfer",
      "formatted_payment_method": "Bank Transfer",
      "payment_reference": "TEST123456",
      "payment_date": "2024-01-15T00:00:00.000000Z",
      "requested_at": "2024-01-15T10:30:00.000000Z",
      "approved_at": null,
      "user": {
        "id": 6,
        "name": "Golden Real Estate",
        "email": "info@goldenrealestate.com",
        "user_type": "company",
        "current_point_balance": 0
      },
      "package": {
        "id": 2,
        "name_en": "Popular Pack",
        "name_mm": "လူကြိုက်များသော ပက်ကေ့ချ်",
        "slug": "popular-pack",
        "points": 50,
        "price_mmk": "35000.00",
        "formatted_price": "35,000 MMK"
      },
      "points_requested": 50,
      "price_mmk": "35000.00",
      "formatted_price": "35,000 MMK",
      "approved_by": null,
      "admin_notes": null,
      "rejected_reason": null,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "can_approve": true,
      "can_reject": true,
      "is_pending": true,
      "is_approved": false,
      "is_rejected": false,
      "is_cancelled": false
    }
  ],
  "pagination": { ... },
  "summary": {
    "total_requests": 5,
    "pending_requests": 2,
    "approved_requests": 2,
    "rejected_requests": 1,
    "cancelled_requests": 0,
    "total_revenue": "175000.00"
  }
}
```

### Approve/Reject Point Purchase Request
**POST** `/point-purchase-requests/{id}/approve`

**Headers:** `Authorization: Bearer {token}`

**Request for Approval:**
```json
{
  "action": "approve",
  "notes": "Payment verified, points allocated"
}
```

**Request for Rejection:**
```json
{
  "action": "reject",
  "rejection_reason": "Payment proof not provided"
}
```

**Response (Approval):**
```json
{
  "success": true,
  "message": "Purchase request approved and points allocated successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "status_label": "Approved",
    "payment_method": "bank_transfer",
    "formatted_payment_method": "Bank Transfer",
    "payment_reference": "TEST123456",
    "payment_date": "2024-01-15T00:00:00.000000Z",
    "requested_at": "2024-01-15T10:30:00.000000Z",
    "approved_at": "2024-01-15T11:00:00.000000Z",
    "user": {
      "id": 6,
      "name": "Golden Real Estate",
      "email": "info@goldenrealestate.com",
      "user_type": "company",
      "current_point_balance": 50
    },
    "package": {
      "id": 2,
      "name_en": "Popular Pack",
      "name_mm": "လူကြိုက်များသော ပက်ကေ့ချ်",
      "slug": "popular-pack",
      "points": 50,
      "price_mmk": "35000.00",
      "formatted_price": "35,000 MMK"
    },
    "points_requested": 50,
    "price_mmk": "35000.00",
    "formatted_price": "35,000 MMK",
    "approved_by": {
      "id": 11,
      "name": "Super Admin"
    },
    "admin_notes": "Payment verified, points allocated",
    "rejected_reason": null,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T11:00:00.000000Z",
    "can_approve": false,
    "can_reject": false,
    "is_pending": false,
    "is_approved": true,
    "is_rejected": false,
    "is_cancelled": false
  }
}
```

**Response (Rejection):**
```json
{
  "success": true,
  "message": "Purchase request rejected successfully",
  "data": {
    "id": 1,
    "status": "rejected",
    "status_label": "Rejected",
    "payment_method": "bank_transfer",
    "formatted_payment_method": "Bank Transfer",
    "payment_reference": "TEST123456",
    "payment_date": "2024-01-15T00:00:00.000000Z",
    "requested_at": "2024-01-15T10:30:00.000000Z",
    "approved_at": null,
    "user": {
      "id": 6,
      "name": "Golden Real Estate",
      "email": "info@goldenrealestate.com",
      "user_type": "company",
      "current_point_balance": 0
    },
    "package": {
      "id": 2,
      "name_en": "Popular Pack",
      "name_mm": "လူကြိုက်များသော ပက်ကေ့ချ်",
      "slug": "popular-pack",
      "points": 50,
      "price_mmk": "35000.00",
      "formatted_price": "35,000 MMK"
    },
    "points_requested": 50,
    "price_mmk": "35000.00",
    "formatted_price": "35,000 MMK",
    "approved_by": null,
    "admin_notes": null,
    "rejected_reason": "Payment proof not provided",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T11:00:00.000000Z",
    "can_approve": false,
    "can_reject": false,
    "is_pending": false,
    "is_approved": false,
    "is_rejected": true,
    "is_cancelled": false
  }
}
```

## Permission Management

### List Permissions
**GET** `/permission`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
  "success": true,
  "message": "Permission list fetched successfully.",
  "data": [
    {
      "id": 1,
      "name": "user.create",
      "slug": "user-create",
      "module": "user",
      "description": "Create users",
      "is_active": true,
      "roles": [
        {
          "id": 1,
          "name": "Super Admin",
          "slug": "super-admin"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### Create Permission
**POST** `/permission`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "property.approve",
  "module": "property",
  "description": "Approve properties",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permission created successfully.",
  "data": {
    "id": 2,
    "name": "property.approve",
    "slug": "property-approve",
    "module": "property",
    "description": "Approve properties",
    "is_active": true,
    "roles": []
  }
}
```

### Get Permission
**GET** `/permission/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Permission
**PUT** `/permission/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Permission
**DELETE** `/permission/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Permission deleted successfully",
  "data": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Common Validation Rules

### Admin User
- `name`: Required, string, max 255 characters
- `email`: Required, valid email, unique
- `password`: Required for create, min 8 characters, confirmed
- `user_type`: Required, must be "admin"
- `is_active`: Boolean
- `role_ids`: Required, array, min 1 item, exists in roles table

### Frontend User
- `is_active`: Boolean (only field that can be updated by admin)

### Property
- `property_type_id`: Required, exists in property_types table
- `listing_type_id`: Required, exists in property_listing_types table
- `title_en`: Required, string, max 255 characters
- `title_mm`: Required, string, max 255 characters
- `description`: Required, string, max 5000 characters
- `property_condition`: Required, in: new, good, fair, poor
- `region_id`: Required, exists in regions table
- `township_id`: Required, exists in townships table
- `address`: Required, string, max 500 characters
- `price`: Required, numeric, min 0
- `area_sqft`: Required, numeric, min 0
- `bedrooms`: Optional, integer, min 0
- `bathrooms`: Optional, integer, min 0
- `owner_name`: Required, string, max 255 characters
- `phone_numbers`: Required, array, min 1 item
- `email`: Required, valid email
- `status`: Required, in: draft, published, sold, rented (default: draft)

### Region/Township/Property Type
- `name_mm`: Required, string, max 255 characters, Myanmar characters only
- `name_en`: Required, string, max 255 characters, English characters only
- `description`: Optional, string, max 255 characters

### Role
- `name`: Required, string, max 255 characters, unique
- `description`: Optional, string, max 500 characters
- `permissions`: Optional, array of permission IDs

### Company Type
- `name_mm`: Required, string, max 255 characters, Myanmar characters only
- `name_en`: Required, string, max 255 characters, English characters, numbers, spaces, hyphens, dots only
- `description`: Optional, string, max 500 characters
- `is_active`: Boolean

### Permission
- `name`: Required, string, max 255 characters, unique
- `module`: Required, string, max 255 characters
- `description`: Optional, string, max 500 characters

### Point Package
- `name_en`: Required, string, max 255 characters, English characters only, unique
- `name_mm`: Required, string, max 255 characters, Myanmar characters only, unique
- `points`: Required, integer, min 1, max 10000
- `price_mmk`: Required, numeric, min 1000, max 10000000
- `description_en`: Optional, string, max 500 characters
- `description_mm`: Optional, string, max 500 characters
- `is_active`: Boolean
- `slug`: Auto-generated from `name_en`, unique, not required in request

### Point Purchase Request Approval
- `action`: Required, in: `approve`, `reject`
- `notes`: Optional, string, max 500 characters (for approval)
- `rejection_reason`: Required when action is `reject`, string, max 500 characters

## JavaScript Examples

### Authentication
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/v1/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('admin_token', data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.data.user));
  }
  
  return data;
};

// Logout
const logout = async () => {
  const token = localStorage.getItem('admin_token');
  
  await fetch('/api/v1/admin/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};
```

## Point System Notes

1. **Point Package Management**: 
   - Use slug-based URLs for all point package operations
   - Slugs are automatically generated from package names (English) and are unique
   - Packages cannot be deleted if they have active users with remaining points
   - Toggle status to activate/deactivate packages without deletion
   - Monitor total purchases and revenue for each package

2. **Point Purchase Request Management**:
   - Review pending requests and verify payment proofs
   - Approve requests to automatically allocate points to users
   - Reject requests with clear reasons for transparency
   - Track approval/rejection statistics and total revenue

3. **Point Allocation**:
   - Points are automatically allocated when requests are approved
   - Points expire after 365 days (configurable)
   - Users can view their current balance and transaction history
   - Points are consumed when users upload properties or use premium features

4. **Revenue Tracking**:
   - Monitor total revenue from point package sales
   - Track revenue by package type and time period
   - Generate reports for financial analysis

5. **Security Considerations**:
   - Only admin users can manage point packages and approve requests
   - All point transactions are logged for audit purposes
   - Payment verification is required before point allocation

## Notes for Frontend Developer

1. **Authentication**: Always include the Bearer token in the Authorization header for protected endpoints
2. **Error Handling**: Check the `success` field in responses and handle errors appropriately
3. **Pagination**: Use the pagination object for implementing pagination controls
4. **Validation**: Handle 422 validation errors by displaying field-specific error messages
5. **Loading States**: Implement loading states for better UX
6. **Token Management**: Store and manage the authentication token securely
7. **Refresh Logic**: Implement token refresh or redirect to login when receiving 401 errors
8. **File Uploads**: For media uploads, use the frontend media upload endpoint and associate with properties
9. **Real-time Updates**: Consider implementing WebSocket or polling for real-time property status updates
10. **Search & Filtering**: Implement search and filtering using the provided query parameters
11. **Point System**: Use slug-based URLs for point packages and ID-based URLs for purchase requests. Slugs are auto-generated from package names.
12. **Revenue Tracking**: Monitor point package sales and purchase request statistics
13. **Payment Verification**: Implement proper payment proof verification before approving requests




## Wanting List Management

### Overview

The Wanting List API allows administrators to manage wanting lists in the system. Wanting lists are user-generated requests for properties they are looking for (e.g., looking to buy or rent). This includes creating, updating, deleting, and monitoring wanting lists.

### Endpoints

#### List Wanting Lists
**GET** `/api/v1/admin/wanted-lists?per_page=1`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `wanted_type` (optional): Filter by wanted type (`buyer`, `renter`)
- `property_type_id` (optional): Filter by property type ID
- `prefer_region_id` (optional): Filter by prefered region ID
- `prefer_township_id` (optional): Filter by prefered township ID
- `min_budget` (optional): Filter by minimum budget
- `max_budget` (optional): Filter by maximum budget
- `bedrooms` (optional): Filter by number of bedrooms
- `bathrooms` (optional): Filter by number of bathrooms
- `min_area` (optional): Filter by minimum area
- `max_area` (optional): Filter by maximum area
- `search` (optional): Search by title, description, or additional requirement
- `sort_by` (optional): Sort field (`created_at`, `updated_at`, `min_budget`, `max_budget`, `title`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Wanting lists retrieved successfully",
  "data": [
     {
        "id": 1,
        "slug": "qqqq",
        "wanted_type": "renter",
        "wanted_type_label": "Renter",
        "title": "qqqq",
        "description": "www",
        "property_type": {
            "id": 15,
            "name_en": "Beach House",
            "name_mm": "ကမ်းခြေအိမ်"
        },
        "location": {
            "region_en": "Yangon",
            "township_en": "Bahan",
            "region_mm": "ရန်ကုန်",
            "township_mm": "ဗဟန်း"
        },
        "budget": {
            "min_budget": "0.00",
            "max_budget": null,
            "budget_range": "0 - ∞ MMK"
        },
        "specifications": {
            "bedrooms": 3,
            "bathrooms": 2,
            "area_range": "123 - 123 sqft"
        },
        "contact": {
            "name": "re",
            "phone": "098888888888",
            "email": null
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": null
        },
        "created_at": "Oct 29, 2025"
      }
  ],
  "pagination": { ... }
}
```

#### Get Wanting List Details
**GET** `/api/v1/admin/wanted-lists/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "message": "Public wanting list retrieved successfully",
    "data": {
        "id": 2,
        "slug": "hello",
        "wanted_type": "renter",
        "wanted_type_label": "Renter",
        "title": "Hello",
        "description": "hello heelllo",
        "additional_requirement": "Hiii",
        "property_type": {
            "id": 15,
            "name_en": "Beach House",
            "name_mm": "ကမ်းခြေအိမ်"
        },
        "preferred_location": {
            "region": {
                "id": 1,
                "name_en": "Yangon",
                "name_mm": "ရန်ကုန်"
            },
            "township": {
                "id": 4,
                "name_en": "Tamwe",
                "name_mm": "တာမွေ"
            }
        },
        "budget": {
            "min_budget": "300000.00",
            "max_budget": "400000.00",
            "budget_range": "300,000 - 400,000 MMK"
        },
        "specifications": {
            "bedrooms": 1,
            "bathrooms": 2,
            "min_area": "123.00",
            "max_area": "222.00",
            "area_range": "123 - 222 sqft"
        },
        "contact": {
            "name": "Tin",
            "email": null,
            "phone": "0999999999"
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": null
        },
        "user": {
            "id": 50,
            "name": "Tin",
            "email": "tinyadanar.1997.yu@gmail.com",
            "user_type": "individual",
            "member_level": "silver"
        },
        "created_at": "Oct 29, 2025"
    }
}
```

#### Create Wanting List
**POST** `/api/v1/admin/wanted-lists`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "wanted_type": "renter",
  "property_type_id": 2,
  "title": "3BR House for Rent",
  "description": "Looking for a 3-bedroom house for rent in peaceful area",
  "prefer_region_id": 1,
  "prefer_township_id": 2,
  "min_budget": 50000,
  "max_budget": 100000,
  "bedrooms": 3,
  "bathrooms": 2,
  "max_area": 2000,
  "min_area": 1500,
  "additional_requirement": "Garden preferred",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+959987654321",
  "status": "published",
  "expires_at": "2024-03-15T10:30:00.000000Z"
}
```

**Field Descriptions:**
- `wanted_type` (required): Wanted type (`buyer` or `renter`)
- `property_type_id` (required): ID of the property type
- `title` (required): Title of the wanting list (max 255 characters)
- `description` (optional): Description of requirements
- `prefer_region_id` (required): ID of preferred region
- `prefer_township_id` (required): ID of preferred township
- `min_budget` (optional): Minimum budget (default: 0)
- `max_budget` (optional): Maximum budget
- `bedrooms` (optional): Number of bedrooms preferred
- `bathrooms` (optional): Number of bathrooms preferred
- `max_area` (optional): Maximum area in sqft
- `min_area` (optional): Minimum area in sqft
- `additional_requirement` (optional): Additional requirements
- `name` (required): Contact name (max 255 characters)
- `email` (optional): Contact email
- `phone` (required): Contact phone (max 20 characters)
- `status` (optional): Status (`published`, `draft`, default: `published`)
- `expires_at` (optional): Expiration date (format: YYYY-MM-DD HH:MM:SS)

**Response:**
```json
{
    "success": true,
    "message": "Wanting list created successfully",
    "data": {
        "id": 3,
        "slug": "apartment-for-rent-wanted",
        "wanted_type": "renter",
        "wanted_type_label": "Renter",
        "title": "Apartment for rent wanted",
        "description": null,
        "additional_requirement": null,
        "property_type": {
            "id": 2,
            "name_en": "Apartment",
            "name_mm": "တိုက်ခန်း"
        },
        "preferred_location": {
            "region": {
                "id": 2,
                "name_en": "Mandalay",
                "name_mm": "မန္တလေး"
            },
            "township": {
                "id": 3,
                "name_en": "Sanchaung",
                "name_mm": "စမ်းချောင်း"
            }
        },
        "budget": {
            "min_budget": "0.00",
            "max_budget": null,
            "budget_range": "0 - ∞ MMK"
        },
        "specifications": {
            "bedrooms": null,
            "bathrooms": null,
            "min_area": null,
            "max_area": null,
            "area_range": "0 - ∞ sqft"
        },
        "contact": {
            "name": "Jane Smith",
            "email": null,
            "phone": "09234567890"
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": null
        },
        "user": {
            "id": 1,
            "name": "Super Admin",
            "email": "admin@myasattyaung.com",
            "user_type": "admin",
            "member_level": "silver"
        },
        "created_at": "Nov 11, 2025"
    }
}
```

#### Update Wanting List
**PUT** `/api/v1/admin/wanted-lists/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "success": true,
    "message": "Wanting list updated successfully",
    "data": {
        "id": 1,
        "slug": "looking-for-3-bedroom-apartment-in-downtown-upd",
        "wanted_type": "buyer",
        "wanted_type_label": "Buyer",
        "title": "Looking for 3-bedroom apartment in downtown UPD",
        "description": "Looking for a modern 3-bedroom apartment with good natural lighting and nearby amenities. Prefer buildings with security and parking facilities.",
        "additional_requirement": "Must have parking space and elevator",
        "property_type": {
            "id": 1,
            "name_en": "House",
            "name_mm": "အိမ်"
        },
        "preferred_location": {
            "region": {
                "id": 1,
                "name_en": "Yangon",
                "name_mm": "ရန်ကုန်"
            },
            "township": {
                "id": 1,
                "name_en": "Downtown",
                "name_mm": "မြို့ပြ"
            }
        },
        "budget": {
            "min_budget": "500000.00",
            "max_budget": "800000.00",
            "budget_range": "500,000 - 800,000 MMK"
        },
        "specifications": {
            "bedrooms": 3,
            "bathrooms": 2,
            "min_area": "1000.00",
            "max_area": "1500.00",
            "area_range": "1,000 - 1,500 sqft"
        },
        "contact": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "09123456789"
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": "2025-12-30T17:30:00.000000Z"
        },
        "user": {
            "id": 5,
            "name": "Soe Hein",
            "email": "soeheindev@gmail.com",
            "user_type": "individual",
            "member_level": "silver"
        },
        "created_at": "Nov 02, 2025"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Wanting list updated successfully",
    "data": {
        "id": 1,
        "slug": "looking-for-3-bedroom-apartment-in-downtown-upd",
        "wanted_type": "buyer",
        "wanted_type_label": "Buyer",
        "title": "Looking for 3-bedroom apartment in downtown UPD",
        "description": "Looking for a modern 3-bedroom apartment with good natural lighting and nearby amenities. Prefer buildings with security and parking facilities.",
        "additional_requirement": "Must have parking space and elevator",
        "property_type": {
            "id": 1,
            "name_en": "House",
            "name_mm": "အိမ်"
        },
        "preferred_location": {
            "region": {
                "id": 1,
                "name_en": "Yangon",
                "name_mm": "ရန်ကုန်"
            },
            "township": {
                "id": 1,
                "name_en": "Downtown",
                "name_mm": "မြို့ပြ"
            }
        },
        "budget": {
            "min_budget": "500000.00",
            "max_budget": "800000.00",
            "budget_range": "500,000 - 800,000 MMK"
        },
        "specifications": {
            "bedrooms": 3,
            "bathrooms": 2,
            "min_area": "1000.00",
            "max_area": "1500.00",
            "area_range": "1,000 - 1,500 sqft"
        },
        "contact": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "09123456789"
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": "2025-12-30T17:30:00.000000Z"
        },
        "user": {
            "id": 5,
            "name": "Soe Hein",
            "email": "soeheindev@gmail.com",
            "user_type": "individual",
            "member_level": "silver"
        },
        "created_at": "Nov 02, 2025"
    }
}
```

#### Delete Wanting List (Soft Delete)
**DELETE** `/api/v1/admin/wanted-lists/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Wanting list deleted successfully",
  "data": null
}
```

#### Restore Wanting List
**POST** `/api/v1/admin/wanted-lists/{slug}/restore`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
    "success": true,
    "message": "Lawer restored successfully",
    "data": {
        "id": 2,
        "slug": "looking-for-3br-house-in-yangon-1",
        "wanted_type": "buyer",
        "wanted_type_label": "Buyer",
        "title": "Looking for 3BR House in Yangon",
        "description": "Need a spacious house for family with good security and near schools",
        "additional_requirement": "Near school and hospital, good security, parking space",
        "property_type": {
            "id": 1,
            "name_en": "House",
            "name_mm": "အိမ်"
        },
        "preferred_location": {
            "region": {
                "id": 1,
                "name_en": "Yangon",
                "name_mm": "ရန်ကုန်"
            },
            "township": {
                "id": 5,
                "name_en": "Thingangyun",
                "name_mm": "သင်္ဃန်းကျွန်း"
            }
        },
        "budget": {
            "min_budget": "50000000.00",
            "max_budget": "80000000.00",
            "budget_range": "50,000,000 - 80,000,000 MMK"
        },
        "specifications": {
            "bedrooms": 3,
            "bathrooms": 2,
            "min_area": "1200.00",
            "max_area": "2000.00",
            "area_range": "1,200 - 2,000 sqft"
        },
        "contact": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "09123456789"
        },
        "status": {
            "verification_status": "approved",
            "status": "published",
            "is_expired": false,
            "is_published": true,
            "expires_at": null
        },
        "user": {
            "id": 5,
            "name": "Soe Hein",
            "email": "soeheindev@gmail.com",
            "user_type": "individual",
            "member_level": "silver"
        },
        "created_at": "Nov 10, 2025"
    }
}
```

#### Force Delete Wanting List (Permanent Delete)
**DELETE** `/api/v1/admin/wanting-lists/{slug}/force`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "WantingList permanently deleted successfully",
  "data": null
}
```

#### Toggle Wanting List Status
**POST** `/api/v1/admin/wanting-lists/{slug}/toggle-status`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Wanting list status toggled successfully",
  "data": {
    "id": 1,
    "slug": "modern-bedroom-wanted-123",
    "is_active": false,
    "status": "inactive"
  }
}
```

#### Get Wanting List Statistics
**GET** `/api/v1/admin/wanting-lists/statistics`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 150,
    "published": 120,
    "draft": 5,
    "pending": 10,
    "approved": 135,
    "rejected": 15,
    "by_type": {
      "buyer": 90,
      "renter": 60
    }
  }
}
```

**Error Responses:**
- **Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "wanted_type": ["The wanted type field is required."],
    "property_type_id": ["The property type id field is required."],
    "title": ["The title field is required."],
    "prefer_region_id": ["The prefer region id field is required."],
    "prefer_township_id": ["The prefer township id field is required."],
    "name": ["The name field is required."],
    "phone": ["The phone field is required."]
  }
}
```

- **Not Found (404):**
```json
{
  "success": false,
  "message": "Wanting list not found"
}
```

- **Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve wanting lists"
}
```
