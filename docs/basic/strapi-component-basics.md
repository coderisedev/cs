# Strapi 组件基础速记

## 1. 组件是什么
- 可以把组件理解为“带固定字段的一组对象模板”。比如 `feature` 组件包含 `heading`, `body`, `media` 字段，任何内容类型引用它时都会出现这三个字段。
- 组件本身不单独存数据，只有当它被某个内容类型引用时才有具体值。
- 组件可以设置为单个或可重复（repeatable）。可重复时，就相当于一个对象数组。

## 2. 命名规则
- 组件 ID 由 `<category>.<component-name>` 组成，纯粹是为了分组管理，和 Single Type/Collection Type 无直接关系。
- 目录结构与命名一致：`src/components/<category>/<component-name>.json`。
- 例子：`homepage.latest-activity` 表示归在 `homepage` 分类下的 `latest-activity` 组件，任何内容类型都可以引用它。

## 3. 与 Single Type / Collection Type 的关系
- Single Type（如 `homepage`）适合全站只需要一条记录的内容。我们常在 Single Type 中插入多个组件字段来构建页面区块。
- Collection Type（如 `product-detail`、`post`）也可以引用相同的组件，实现跨内容类型的复用。
- 组件只是字段的组合；它不会限制只能在特定 Single Type 使用。

## 4. 实际创建流程
1. 在 Strapi Content-Type Builder 或 schema JSON 中定义组件的字段集合。
2. 在目标内容类型中添加一个 `component` 字段（可选 repeatable）。
3. 重启 Strapi（若修改了 schema 文件），然后在 Admin 中填写该组件的数据。
4. 前端通过 API 请求 `populate` 对应字段即可得到组件内容。

## 5. 示例：Homepage 最新活动模块
- 定义组件：`homepage.latest-activity`，字段包含 `title`, `summary`, `date`, `image`, `cta_label`, `cta_url`。
- 在 `homepage` Single Type 中添加一个字段 `latest_activity`，类型为 component，指向 `homepage.latest-activity`（可选 repeatable）。
- 在 Strapi Admin → Homepage 中填写活动数据并发布。
- Next.js 前端请求 `/api/homepage?populate[latest_activity]=image`，渲染出最新活动区块。

## 小结
组件 = 可复用的字段集合。通过 category 分组、repeatable 控制数量，把复杂页面拆成多个模块化区块，既方便内容团队维护，也让前端渲染逻辑保持一致。
