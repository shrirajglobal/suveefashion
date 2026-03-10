

## Step-by-Step Implementation Phases

Here's how we'll break this into manageable phases, each fully testable before moving to the next:

---

### Phase 1: Registration Update
- Add "How did you hear about Suvee?" dropdown to registration form (YouTube, Facebook, WhatsApp, Friends, Others)
- Add `referral_source` column to `buyer_profiles` table
- Show referral source in Admin Buyers panel

**Test**: Register a new account and verify the field saves and shows in admin.

---

### Phase 2: Customer Discount System
- Add `discount_percent` column to `buyer_profiles`
- Add discount % input in Admin Buyers when approving/editing a buyer
- Expose `discountPercent` in AuthContext for use in future product display

**Test**: Approve a buyer with 10% discount, verify it saves and loads in context.

---

### Phase 3: Product Schema Overhaul
- Remove `bulk_price_50`, `bulk_price_100`, `bulk_price_500` columns
- Rename `moq` to `pcs_per_set`
- Add `bundle_type` (combo/colour_chart/assorted), `available_sizes`, `combo_description`
- Seed categories (Kurti, Short Kurti, Kurti Pant Set, Dupatta Set, Dresses, Coord Sets, Bottom Wear, Nighty)

**Test**: Verify migration runs clean, existing data intact.

---

### Phase 4: Admin Product Form Redesign
- Fabric dropdown with predefined list + "Others" option
- Bundle type selector (Combo / Colour Chart / Assorted) with contextual size pickers
- Pcs per set field, WSP only (no bulk prices)
- Multi-image upload to storage bucket
- Bulk Add mode: upload multiple images with shared details, creates N products at once

**Test**: Create products with each bundle type, upload images, use bulk add.

---

### Phase 5: Cart Quantity Logic + Price Display
- Cart quantities restricted to multiples of `pcs_per_set` (+/- buttons step by set size)
- Price display: ~~WSP~~ then discounted price + "GST (5%)" label
- Only logged-in approved buyers see their discount; others see WSP only

**Test**: Add products to cart, verify quantity snapping and discount display.

---

### Recommended Starting Point

**Phase 1** is the smallest and safest change. Shall I implement it first?

