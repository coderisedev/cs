-- ============================================
-- Medusa US Region 配置脚本
-- ============================================
-- 用途: 创建/更新 US region，添加全球国家支持
-- 数据库: medusa_local
-- 警告: 运行前请备份数据库
-- ============================================

-- ============================================
-- 阶段 1: 查看现有 US region
-- ============================================
DO $$
DECLARE
    us_region_record RECORD;
BEGIN
    SELECT id, name, currency_code INTO us_region_record
    FROM region
    WHERE currency_code = 'usd'
    LIMIT 1;

    IF FOUND THEN
        RAISE NOTICE 'Found existing USD region: ID=%, Name=%', us_region_record.id, us_region_record.name;
    ELSE
        RAISE NOTICE 'No USD region found. You need to create one in Medusa Admin.';
    END IF;
END $$;

-- ============================================
-- 阶段 2: 查看当前 US region 包含的国家
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    c.iso_2 AS country_code,
    c.display_name AS country_name
FROM region r
INNER JOIN country c ON r.id = c.region_id
WHERE r.currency_code = 'usd'
ORDER BY c.iso_2;

-- ============================================
-- 阶段 3: (可选) 添加更多国家到 US region
-- ============================================
-- 如果你希望支持全球发货但使用 USD，取消下面注释
-- 注意: 需要先获取 US region ID 替换 <US_REGION_ID>

/*
-- 获取 US region ID (手动执行)
\set us_region_id (SELECT id FROM region WHERE currency_code = 'usd' LIMIT 1)

-- 添加常见国家到 US region
-- 这些国家将能够使用 USD 下单

UPDATE country SET region_id = :'us_region_id' 
WHERE iso_2 IN (
    'CA',  -- Canada
    'GB',  -- United Kingdom  
    'AU',  -- Australia
    'NZ',  -- New Zealand
    'SG',  -- Singapore
    'JP',  -- Japan
    'CN',  -- China
    'DE',  -- Germany
    'FR',  -- France
    'ES',  -- Spain
    'IT',  -- Italy
    'MX'   -- Mexico
);
*/

-- ============================================
-- 阶段 4: 验证国家已添加
-- ============================================
SELECT 
    r.id AS region_id,
    r.name AS region_name,
    r.currency_code,
    COUNT(c.id) AS total_countries,
    STRING_AGG(c.iso_2, ', ' ORDER BY c.iso_2) AS country_codes
FROM region r
LEFT JOIN country c ON r.id = c.region_id
WHERE r.currency_code = 'usd'
GROUP BY r.id, r.name, r.currency_code;

-- ============================================
-- 阶段 5: (可选) 标记其他 regions 为 inactive
-- ============================================
-- 不删除，只是标记为不活跃（通过 metadata）
-- 取消注释以执行

/*
UPDATE region 
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb), 
    '{active}', 
    'false'
)
WHERE currency_code != 'usd';

-- 验证
SELECT id, name, currency_code, metadata 
FROM region 
ORDER BY currency_code;
*/

-- ============================================
-- 阶段 6: 检查 Sales Channel 配置
-- ============================================
-- 确保 default sales channel 关联到 US region

SELECT 
    sc.id AS sales_channel_id,
    sc.name AS sales_channel_name,
    sc.is_disabled,
    scl.location_id AS region_id,
    r.name AS region_name,
    r.currency_code
FROM sales_channel sc
LEFT JOIN sales_channel_location scl ON sc.id = scl.sales_channel_id
LEFT JOIN region r ON scl.location_id = r.id
WHERE sc.name = 'Default Sales Channel'
   OR sc.is_default = true;

-- ============================================
-- 阶段 7: (可选) 更新 default sales channel 到 US region
-- ============================================
/*
-- 首先删除现有关联
DELETE FROM sales_channel_location 
WHERE sales_channel_id = (SELECT id FROM sales_channel WHERE name = 'Default Sales Channel' LIMIT 1);

-- 添加 US region 关联
INSERT INTO sales_channel_location (sales_channel_id, location_id, created_at, updated_at)
SELECT 
    sc.id,
    r.id,
    NOW(),
    NOW()
FROM sales_channel sc
CROSS JOIN region r
WHERE sc.name = 'Default Sales Channel'
  AND r.currency_code = 'usd'
LIMIT 1;
*/

-- ============================================
-- 阶段 8: 验证 Publishable API Key 配置
-- ============================================
SELECT 
    pak.id AS key_id,
    pak.title,
    STRING_AGG(DISTINCT sc.name, ', ') AS channels,
    STRING_AGG(DISTINCT r.name, ', ') AS regions
FROM publishable_api_key pak
LEFT JOIN publishable_api_key_sales_channel paksc ON pak.id = paksc.publishable_key_id
LEFT JOIN sales_channel sc ON paksc.sales_channel_id = sc.id
LEFT JOIN sales_channel_location scl ON sc.id = scl.sales_channel_id
LEFT JOIN region r ON scl.location_id = r.id
GROUP BY pak.id, pak.title;

-- ============================================
-- 阶段 9: (重要) 更新现有购物车到 US region
-- ============================================
-- 如果有未完成的购物车使用其他 region，更新它们
-- 警告: 这会影响用户当前购物车

/*
UPDATE cart 
SET region_id = (SELECT id FROM region WHERE currency_code = 'usd' LIMIT 1)
WHERE completed_at IS NULL
  AND region_id != (SELECT id FROM region WHERE currency_code = 'usd' LIMIT 1);

-- 验证更新
SELECT 
    ca.id,
    ca.region_id,
    r.name AS region_name,
    r.currency_code,
    ca.updated_at
FROM cart ca
LEFT JOIN region r ON ca.region_id = r.id
WHERE ca.completed_at IS NULL
ORDER BY ca.updated_at DESC
LIMIT 10;
*/

-- ============================================
-- 阶段 10: 最终验证 - 输出配置摘要
-- ============================================
DO $$
DECLARE
    us_region_id TEXT;
    country_count INT;
    sales_channel_count INT;
BEGIN
    -- 获取 US region ID
    SELECT id, COUNT(*) INTO us_region_id, country_count
    FROM region r
    LEFT JOIN country c ON r.id = c.region_id
    WHERE r.currency_code = 'usd'
    GROUP BY r.id
    LIMIT 1;

    -- 获取关联的 sales channels 数量
    SELECT COUNT(DISTINCT sc.id) INTO sales_channel_count
    FROM sales_channel sc
    INNER JOIN sales_channel_location scl ON sc.id = scl.sales_channel_id
    WHERE scl.location_id = us_region_id;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'US Region Configuration Summary';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Region ID: %', us_region_id;
    RAISE NOTICE 'Countries: %', country_count;
    RAISE NOTICE 'Sales Channels: %', sales_channel_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Add this to .env.local:';
    RAISE NOTICE 'NEXT_PUBLIC_REGION_ID=%', us_region_id;
    RAISE NOTICE '============================================';
END $$;

-- ============================================
-- 使用指南
-- ============================================
-- 
-- 1. 连接到数据库:
--    psql -h 127.0.0.1 -p 5432 -U cs -d medusa_local
--
-- 2. 运行查询阶段:
--    - 阶段 1-2: 查看现有配置 (安全)
--    - 阶段 3-5: 修改配置 (需取消注释并谨慎执行)
--    - 阶段 6-8: 验证 Sales Channel (安全)
--    - 阶段 9: 更新购物车 (需取消注释)
--    - 阶段 10: 输出最终配置 (安全)
--
-- 3. 复制 Region ID 到 .env.local
--
-- 4. 如果没有 USD region:
--    - 在 Medusa Admin 手动创建
--    - 或使用 seed 脚本: pnpm --filter medusa seed
--
-- ============================================
