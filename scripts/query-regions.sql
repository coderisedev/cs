-- ============================================
-- Medusa Region 信息查询脚本
-- ============================================
-- 用途: 获取所有 region 配置，用于方案 A 实施
-- 数据库: medusa_local
-- ============================================

-- 1. 查询所有 regions 及其基本信息
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    r.tax_rate,
    r.created_at,
    r.updated_at,
    r.metadata
FROM region r
ORDER BY r.created_at;

-- 2. 查询 regions 及其关联的国家
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    c.iso_2 AS country_code,
    c.display_name AS country_name,
    c.iso_3,
    c.num_code
FROM region r
LEFT JOIN country c ON r.id = c.region_id
ORDER BY r.name, c.iso_2;

-- 3. 查询特定 US region (通过货币或名称)
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    r.tax_rate,
    COUNT(c.id) AS country_count,
    STRING_AGG(c.iso_2, ', ' ORDER BY c.iso_2) AS countries
FROM region r
LEFT JOIN country c ON r.id = c.region_id
WHERE r.currency_code = 'usd' 
   OR LOWER(r.name) LIKE '%united states%'
   OR LOWER(r.name) LIKE '%us%'
GROUP BY r.id, r.name, r.currency_code, r.tax_rate;

-- 4. 查询所有国家及其所属 region
-- ============================================
SELECT 
    c.iso_2 AS country_code,
    c.display_name AS country_name,
    c.region_id,
    r.name AS region_name,
    r.currency_code
FROM country c
LEFT JOIN region r ON c.region_id = r.id
ORDER BY c.iso_2;

-- 5. 查询 regions 及其关联的 sales channels
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    sc.id AS sales_channel_id,
    sc.name AS sales_channel_name,
    sc.description AS sales_channel_description,
    sc.is_disabled
FROM region r
LEFT JOIN sales_channel_location scl ON r.id = scl.location_id
LEFT JOIN sales_channel sc ON scl.sales_channel_id = sc.id
ORDER BY r.name, sc.name;

-- 6. 统计每个 region 的商品数量（通过 product_sales_channel）
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    COUNT(DISTINCT pv.product_id) AS product_count,
    COUNT(DISTINCT pv.id) AS variant_count
FROM region r
LEFT JOIN product_variant pv ON r.currency_code = pv.currency_code
GROUP BY r.id, r.name, r.currency_code
ORDER BY r.name;

-- 7. 查询 publishable API keys 及其关联的 sales channels
-- ============================================
SELECT 
    pak.id AS publishable_key_id,
    pak.title,
    pak.created_by,
    STRING_AGG(DISTINCT sc.name, ', ') AS sales_channels,
    STRING_AGG(DISTINCT r.name, ', ') AS regions
FROM publishable_api_key pak
LEFT JOIN publishable_api_key_sales_channel paksc ON pak.id = paksc.publishable_key_id
LEFT JOIN sales_channel sc ON paksc.sales_channel_id = sc.id
LEFT JOIN sales_channel_location scl ON sc.id = scl.sales_channel_id
LEFT JOIN region r ON scl.location_id = r.id
GROUP BY pak.id, pak.title, pak.created_by;

-- 8. 查询当前有效的购物车及其 region
-- ============================================
SELECT 
    ca.id AS cart_id,
    ca.region_id,
    r.name AS region_name,
    r.currency_code,
    ca.created_at,
    ca.updated_at,
    COUNT(li.id) AS item_count
FROM cart ca
LEFT JOIN region r ON ca.region_id = r.id
LEFT JOIN line_item li ON ca.id = li.cart_id
WHERE ca.completed_at IS NULL
GROUP BY ca.id, ca.region_id, r.name, r.currency_code, ca.created_at, ca.updated_at
ORDER BY ca.updated_at DESC
LIMIT 20;

-- 9. 快速获取推荐的 US region ID (用于环境变量配置)
-- ============================================
-- 这个查询返回单个结果，可直接用于 NEXT_PUBLIC_REGION_ID
SELECT 
    r.id AS us_region_id,
    r.name AS region_name,
    r.currency_code,
    COUNT(c.id) AS country_count
FROM region r
LEFT JOIN country c ON r.id = c.region_id
WHERE r.currency_code = 'usd'
GROUP BY r.id, r.name, r.currency_code
ORDER BY COUNT(c.id) DESC
LIMIT 1;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 连接到 medusa_local 数据库
-- 2. 按顺序执行查询或选择性执行
-- 3. 查询 9 的结果用于设置 NEXT_PUBLIC_REGION_ID
-- 4. 如果没有 USD region，需要先在 Medusa Admin 创建
-- ============================================
