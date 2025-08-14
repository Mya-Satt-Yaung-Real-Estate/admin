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

## Property Management

### List All Properties
**GET** `/properties`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by title, description, or address
- `sort_by` (optional): Sort field (default: `created_at`)
- `sort_direction` (optional): Sort direction (`asc` or `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": [
    {
            "id": 3,
            "user_id": 3,
            "property_type": {
                "id": 1,
                "name_en": "House",
                "name_mm": "အိမ်",
                "slug": "house"
            },
            "listing_type": {
                "id": 1,
                "name_en": "For Sale",
                "name_mm": "ရောင်းရန်",
                "slug": "for-sale"
            },
            "title_en": "Beautiful House for Sale 3",
            "title_mm": "လှပတဲ့ အိမ်ရောင်းမယ် 3",
            "description": "This is a beautiful 3-bedroom house located in a prime area. Perfect for families looking for a comfortable home with modern amenities.",
            "property_condition": "good",
            "location": {
                "region": {
                    "id": 1,
                    "name_en": "Yangon",
                    "name_mm": "ရန်ကုန်"
                },
                "township": {
                    "id": 1,
                    "name_en": "Downtown",
                    "name_mm": "မြို့ပြ"
                },
                "address": "123 Main Street, Downtown",
                "latitude": "16.86610000",
                "longitude": "96.19510000",
                "location_string": "Downtown, Yangon",
                "location_string_mm": "မြို့ပြ, ရန်ကုန်"
            },
            "price": "150000000.00",
            "formatted_price": "150,000,000 MMK",
            "area_sqft": "2500.00",
            "bedrooms": 3,
            "bathrooms": 2,
            "bank_installment_available": true,
            "features": [
                "parking",
                "swimming_pool"
            ],
            "contact_info": {
                "owner_name": "John Doe",
                "phone_numbers": [
                    "09123456789",
                    "09234567890"
                ],
                "email": "john.doe@example.com"
            },
            "status": "draft",
            "is_featured": false,
            "stats": {
                "view_count": 0,
                "contact_count": 0,
                "favorite_count": 0
            },
            "dates": {
                "published_at": null,
                "expires_at": null,
                "created_at": "2025-08-14T06:58:01.000000Z",
                "verified_at": null
            },
            "verification_status": "pending",
            "rejection_reason": null,
            "is_published": false,
            "is_draft": true,
            "is_sold": false,
            "is_rented": false,
            "is_expired": false,
            "can_be_published": true,
            "is_approved": false,
            "is_pending_approval": true,
            "is_rejected": false,
            "media": {
                "images": [
                    {
                        "id": 19,
                        "type": "image",
                        "filename": "SampleJPGImage_2mbmb.jpg",
                        "is_primary": false,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a23efd9.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a21a5ec_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a22be74_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a207803_thumbnail.jpg"
                    },
                    {
                        "id": 18,
                        "type": "image",
                        "filename": "SampleJPGImage_2mbmb.jpg",
                        "is_primary": true,
                        "status": "completed",
                        "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a0abb90.jpg",
                        "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a08ac28_small.jpg",
                        "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a099c20_medium.jpg",
                        "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a07c728_thumbnail.jpg"
                    }
                ],
                "videos": [],
                "primary_image": {
                    "id": 18,
                    "type": "image",
                    "filename": "SampleJPGImage_2mbmb.jpg",
                    "is_primary": true,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a0abb90.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a08ac28_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a099c20_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88a07c728_thumbnail.jpg"
                }
            }
        },
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
        "id": 1,
        "user_id": 3,
        "property_type": {
            "id": 1,
            "name_en": "House",
            "name_mm": "အိမ်",
            "slug": "house"
        },
        "listing_type": {
            "id": 1,
            "name_en": "For Sale",
            "name_mm": "ရောင်းရန်",
            "slug": "for-sale"
        },
        "title_en": "Beautiful House for Sale 1",
        "title_mm": "လှပတဲ့ အိမ်ရောင်းမယ် 3",
        "description": "This is a beautiful 3-bedroom house located in a prime area. Perfect for families looking for a comfortable home with modern amenities.",
        "property_condition": "good",
        "location": {
            "region": {
                "id": 1,
                "name_en": "Yangon",
                "name_mm": "ရန်ကုန်"
            },
            "township": {
                "id": 1,
                "name_en": "Downtown",
                "name_mm": "မြို့ပြ"
            },
            "address": "123 Main Street, Downtown",
            "latitude": "16.86610000",
            "longitude": "96.19510000",
            "location_string": "Downtown, Yangon",
            "location_string_mm": "မြို့ပြ, ရန်ကုန်"
        },
        "price": "150000000.00",
        "formatted_price": "150,000,000 MMK",
        "area_sqft": "2500.00",
        "bedrooms": 3,
        "bathrooms": 2,
        "bank_installment_available": true,
        "features": [
            "parking",
            "swimming_pool"
        ],
        "contact_info": {
            "owner_name": "John Doe",
            "phone_numbers": [
                "09123456789",
                "09234567890"
            ],
            "email": "john.doe@example.com"
        },
        "status": "published",
        "is_featured": false,
        "stats": {
            "view_count": 3,
            "contact_count": 0,
            "favorite_count": 0
        },
        "dates": {
            "published_at": "2025-08-14T06:57:27.000000Z",
            "expires_at": null,
            "created_at": "2025-08-14T06:57:27.000000Z",
            "verified_at": null
        },
        "verification_status": "pending",
        "rejection_reason": null,
        "is_published": true,
        "is_draft": false,
        "is_sold": false,
        "is_rented": false,
        "is_expired": false,
        "can_be_published": false,
        "is_approved": false,
        "is_pending_approval": true,
        "is_rejected": false,
        "media": {
            "images": [
                {
                    "id": 15,
                    "type": "image",
                    "filename": "SampleJPGImage_2mbmb.jpg",
                    "is_primary": false,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8898c701f.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8898a88ae_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8898b8837_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8898983cd_thumbnail.jpg"
                },
                {
                    "id": 14,
                    "type": "image",
                    "filename": "SampleJPGImage_2mbmb.jpg",
                    "is_primary": true,
                    "status": "completed",
                    "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d889436d98.jpg",
                    "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d889402a3a_small.jpg",
                    "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88941c28b_medium.jpg",
                    "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8893dc2f2_thumbnail.jpg"
                }
            ],
            "videos": [
              
            ],
            "primary_image": {
                "id": 14,
                "type": "image",
                "filename": "SampleJPGImage_2mbmb.jpg",
                "is_primary": true,
                "status": "completed",
                "url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d889436d98.jpg",
                "small_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d889402a3a_small.jpg",
                "medium_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d88941c28b_medium.jpg",
                "thumbnail_url": "https://d1fh9vvudcnn2n.cloudfront.net/images/2025/08/14/689d8893dc2f2_thumbnail.jpg"
            }
        }
    }
}
```

### Create Property
**POST** `/properties`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "property_type_id": 1,
  "listing_type_id": 1,
  "title_en": "New Property",
  "title_mm": "အိမ်အသစ်",
  "description": "A new property for sale",
  "property_condition": "new",
  "region_id": 1,
  "township_id": 1,
  "address": "456 New Street",
  "latitude": 16.8661,
  "longitude": 96.1951,
  "price": 600000,
  "area_sqft": 2000,
  "bedrooms": 4,
  "bathrooms": 3,
  "bank_installment_available": true,
  "features": ["garden", "parking", "security"],
  "owner_name": "Jane Doe",
  "phone_numbers": ["+959987654321"],
  "email": "jane@example.com",
  "status": "published",
  "is_featured": false,
  "is_verified": true,
  "published_at": "2024-01-15T10:30:00.000000Z",
  "expires_at": "2024-02-15T10:30:00.000000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": 2,
    "title_en": "New Property",
    "title_mm": "အိမ်အသစ်",
    "description": "A new property for sale",
    "price": 600000,
    "area_sqft": 2000,
    "bedrooms": 4,
    "bathrooms": 3,
    "property_condition": "new",
    "status": "published",
    "verification_status": "pending",
    "is_featured": false,
    "is_verified": true,
    "user": { ... },
    "property_type": { ... },
    "listing_type": { ... },
    "region": { ... },
    "township": { ... }
  }
}
```

### Update Property
**PUT** `/properties/{id}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create property

**Response:**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": 1,
    "title_en": "Updated Property",
    "title_mm": "အိမ်အသစ်",
    "description": "An updated property",
    "price": 700000,
    "area_sqft": 2500,
    "bedrooms": 5,
    "bathrooms": 4,
    "property_condition": "good",
    "status": "published",
    "verification_status": "approved",
    "is_featured": true,
    "is_verified": true,
    "user": { ... },
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

## Region Management

### List Regions
**GET** `/regions`

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
**POST** `/regions`

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
**GET** `/regions/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Region
**PUT** `/regions/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Region
**DELETE** `/regions/{slug}`

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
**GET** `/townships`

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
**POST** `/townships`

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
**GET** `/townships/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Response:** Same format as create response

### Update Township
**PUT** `/townships/{slug}`

**Headers:** `Authorization: Bearer {token}`

**Request:** Same format as create request

**Response:** Same format as create response

### Delete Township
**DELETE** `/townships/{slug}`

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
**GET** `/property-types`

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
**GET** `/property-listing-types`

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



## User Management (Individual, Company)

### List Users
**GET** `/users`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:** Same as regions

**Response:**
```json
{
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
        {
            "id": 3,
            "name": "John Doe",
            "slug": "john-doe",
            "email": "john@company.com",
            "user_type": "company",
            "member_level": "silver",
            "is_active": true,
            "last_login_at": "2025-08-14T06:54:01.000000Z",
            "last_active_at": "2025-08-14T06:54:01.000000Z",
            "email_verified_at": null,
            "created_at": "2025-08-12T08:24:56.000000Z",
            "updated_at": "2025-08-14T06:54:01.000000Z"
        },
        {
            "id": 2,
            "name": "Test User",
            "slug": "test-user",
            "email": "test@example.com",
            "user_type": "individual",
            "member_level": "silver",
            "is_active": true,
            "last_login_at": "2025-08-12T08:54:18.000000Z",
            "last_active_at": "2025-08-12T08:54:18.000000Z",
            "email_verified_at": null,
            "created_at": "2025-08-12T07:11:37.000000Z",
            "updated_at": "2025-08-12T08:54:18.000000Z"
        }
    ]
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

### Region/Township/Property Type
- `name_mm`: Required, string, max 255 characters, Myanmar characters only
- `name_en`: Required, string, max 255 characters, English characters only
- `description`: Optional, string, max 255 characters

### Role
- `name`: Required, string, max 255 characters, unique
- `description`: Optional, string, max 500 characters
- `permissions`: Optional, array of permission IDs

### Permission
- `name`: Required, string, max 255 characters, unique
- `module`: Required, string, max 255 characters
- `description`: Optional, string, max 500 characters

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

### API Helper
```javascript
// API helper function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('admin_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  
  const response = await fetch(`/api/v1/admin${endpoint}`, {
    ...defaultOptions,
    ...options,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data;
};

// Usage examples
const getProperties = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/properties?${queryString}`);
};

const createProperty = (propertyData) => {
  return apiCall('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
};

const updateProperty = (id, propertyData) => {
  return apiCall(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });
};

const deleteProperty = (id) => {
  return apiCall(`/properties/${id}`, {
    method: 'DELETE',
  });
};

const approveProperty = (id) => {
  return apiCall(`/properties/${id}/verification`, {
    method: 'POST',
    body: JSON.stringify({ action: 'approve' }),
  });
};

const rejectProperty = (id, reason) => {
  return apiCall(`/properties/${id}/verification`, {
    method: 'POST',
    body: JSON.stringify({ action: 'reject', reason }),
  });
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAdminAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callAPI };
};

// Usage in component
const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({});
  const { loading, error, callAPI } = useAdminAPI();

  const fetchProperties = async (params = {}) => {
    try {
      const result = await callAPI(getProperties, params);
      setProperties(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {properties.map(property => (
        <div key={property.id}>
          <h3>{property.title_en}</h3>
          <p>{property.title_mm}</p>
          <p>Price: ${property.price}</p>
          <p>Status: {property.verification_status}</p>
        </div>
      ))}
    </div>
  );
};
```

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
