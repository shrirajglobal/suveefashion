

# Suvee Fashion — Complete B2B Website Plan

## Phase 1: Foundation & Public-Facing Website

### 1.1 Homepage & Branding
- Kurti-themed color palette: maroon, gold, cream, soft pink accents
- Hero banner with seasonal collection imagery and tagline
- "About Suvee Fashion" section — factory story, Kolkata heritage, manufacturing scale
- Factory photo gallery / virtual showroom
- Partner testimonials and trust badges (GST registered, years in business)
- Social media section: WhatsApp Community join link, YouTube Channel subscribe button

### 1.2 Multilingual Support (English, Hindi, Bengali)
- Language switcher in header, persistent across all pages
- All static content translated in 3 languages
- AI chatbot auto-detects and responds in user's language

### 1.3 Navigation & Layout
- Pages: Home, Catalogues, About Us, Contact, AI Business Advisor
- Sticky WhatsApp floating button on all pages
- Mobile-optimized with bottom navigation bar
- Desktop: clean top nav with mega-menu for catalogue categories

### 1.4 AI Business Advisor Chatbot
- **Role**: Free business consultant for kurti retailers/wholesalers — NOT just product support
- **Covers real business problems**:
  - "How to start a kurti business?" → step-by-step actionable guide
  - "Not getting customers" → local marketing tips, WhatsApp catalogue sharing, social media, festive offers
  - "How to manage funds/collection?" → simple bookkeeping, payment terms, credit management
  - "Which kurtis sell best in summer?" → fabric and style guidance
  - "How to price my kurtis?" → markup strategies, competitor benchmarking
- **Language**: Detects Hindi, Bengali, or English and responds accordingly
- **Answers are short and practical**: 3-5 actionable points, no jargon
- **Suvee promotion only after 3-4 helpful exchanges** — subtle, never pushy
- **UI**: Real chat feel — bubbles, typing indicator, timestamps, suggestion chips for common questions
- **Tech**: Supabase Edge Function + Lovable AI Gateway (google/gemini-3-flash-preview), streaming responses, no login required

---

## Phase 2: Catalogue System & Buyer Access

### 2.1 Public Catalogue (No Login Required)
- Product grid with categories: Casual Kurtis, Festive Wear, Cotton Collection, Designer Range, etc.
- Each product shows: images, fabric type, available sizes, MOQ
- **NO prices visible** — instead, a prominent banner/badge on each product:
  > "Want bulk order discounts? Register as a Suvee buyer to see wholesale prices and place orders."
- Filter by: category, fabric type, size range, season
- "Download Catalogue PDF" per collection (without prices)
- "Express Interest" button — inquiry form for non-registered visitors

### 2.2 Buyer Registration & Admin Approval
- Registration form: business name, GST number, city/state, contact person, phone, email, type of business (retailer/wholesaler)
- After registration: account status = **Pending Approval**
- Pending users see a message: "Your account is under review. Our team will verify and approve within 24-48 hours."
- Admin approves/rejects from admin panel
- On approval: buyer gets email/SMS notification and can now log in

### 2.3 Approved Buyer Catalogue View
- Once logged in (approved buyers only):
  - **WSP (Wholesale Selling Price)** visible on all products
  - **Bulk pricing tiers** shown (e.g., 50-100 pcs, 100-500 pcs, 500+ pcs)
  - "Add to Cart" and "Request Sample" buttons enabled
  - Download catalogue PDF **with prices**
- Unapproved/pending buyers who log in still see no prices — shown approval pending message

---

## Phase 3: Order System & Buyer Dashboard

### 3.1 Cart & Order Placement (Approved Buyers Only)
- Add-to-cart with quantity selection (respecting MOQ)
- Order summary with applicable pricing tier
- Order submission — payment handled offline (bank transfer/COD, standard Indian B2B)
- Order confirmation with reference number

### 3.2 Sample Request System
- Request fabric/design samples before committing to bulk
- Track sample request status in buyer dashboard

### 3.3 Buyer Dashboard
- Order history with status tracking (Placed → Confirmed → Dispatched → Delivered)
- Sample request history
- Profile management (update business details)
- Download past invoices

### 3.4 Inquiry System
- "Express Interest" form for non-registered visitors on any product
- Captures: business name, contact, products of interest, expected quantity
- All inquiries flow to admin panel

---

## Phase 4: Admin Panel

### 4.1 Dashboard
- Overview: total inquiries, pending registrations, active orders, registered buyers count
- Quick actions: approve buyers, view new orders

### 4.2 Catalogue Management
- Upload products: images, description, fabric, sizes, MOQ
- Set WSP and bulk pricing tiers per product
- Organize into categories and collections
- Mark products as featured / new arrival
- Upload collection PDF catalogues

### 4.3 Buyer Management
- View all registered buyers with status (pending/approved/rejected)
- Approve or reject buyer registrations
- View buyer order history and activity

### 4.4 Order Management
- View all orders, filter by status
- Update order status (Confirmed → Dispatched → Delivered)
- Add tracking info and notes

### 4.5 Inquiry Management
- View all inquiries from non-registered visitors
- Mark as contacted / converted
- Convert inquiry to buyer registration invite

---

## Phase 5: Advanced Features

### 5.1 Seasonal Campaigns
- Featured collection banners (Durga Puja, Diwali, Eid, summer specials)
- New arrivals section with auto-highlighting

### 5.2 Regional Delivery Info
- Delivery zones — West Bengal focus + pan-India coverage
- Estimated delivery timelines by region

### 5.3 Admin Analytics
- Most viewed products, popular categories
- Inquiry-to-registration conversion tracking
- Buyer engagement metrics
- Order volume trends

### 5.4 GST Invoice Generation
- Auto-generate GST-compliant invoices for orders

---

## Technical Architecture
- **Frontend**: React + Tailwind CSS, fully responsive (mobile-first)
- **Backend**: Lovable Cloud (Supabase) — database, auth, storage, edge functions
- **AI Chat**: Supabase Edge Function + Lovable AI Gateway (streaming)
- **Storage**: Supabase Storage for product images and catalogue PDFs
- **Auth**: Supabase Auth with registration + admin approval workflow
- **Database Tables**: products, categories, buyer_profiles, orders, order_items, inquiries, sample_requests, user_roles (admin/buyer)
- **RLS**: Prices and order features restricted to approved buyers; admin functions restricted to admin role

