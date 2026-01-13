import type { Schema, Struct } from '@strapi/strapi';

export interface HomepageCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_homepage_cta_buttons';
  info: {
    description: '\u53EF\u91CD\u7528\u7684\u884C\u52A8\u53F7\u53EC\u6309\u94AE\u7EC4\u4EF6';
    displayName: 'CTA Button';
    icon: 'cursor';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    style: Schema.Attribute.Enumeration<['primary', 'secondary', 'text']> &
      Schema.Attribute.DefaultTo<'primary'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageProductHighlight extends Struct.ComponentSchema {
  collectionName: 'components_homepage_product_highlights';
  info: {
    description: '\u4EA7\u54C1\u4EAE\u70B9\u4FE1\u606F\u7EC4\u4EF6';
    displayName: 'Product Highlight';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface ProductContentSection extends Struct.ComponentSchema {
  collectionName: 'components_product_content_sections';
  info: {
    description: 'Mixed media section with title, description, and optional media';
    displayName: 'Content Section';
    icon: 'layout';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    media_position: Schema.Attribute.Enumeration<
      ['left', 'right', 'top', 'bottom', 'content-bottom']
    > &
      Schema.Attribute.DefaultTo<'right'>;
    theme: Schema.Attribute.Enumeration<['light', 'gray']> &
      Schema.Attribute.DefaultTo<'light'>;
  };
}

export interface ProductFeatureBullet extends Struct.ComponentSchema {
  collectionName: 'components_product_feature_bullets';
  info: {
    description: 'Simple feature bullet point with optional icon';
    displayName: 'Feature Bullet';
    icon: 'check';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }> &
      Schema.Attribute.DefaultTo<'check'>;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ProductPackageItem extends Struct.ComponentSchema {
  collectionName: 'components_product_package_items';
  info: {
    description: 'Single item included in the package';
    displayName: 'Package Item';
    icon: 'box';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface ProductSpecGroup extends Struct.ComponentSchema {
  collectionName: 'components_product_spec_groups';
  info: {
    description: 'Grouped technical specifications with a category label';
    displayName: 'Spec Group';
    icon: 'server';
  };
  attributes: {
    group_name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    items: Schema.Attribute.Component<'product.spec-item', true>;
  };
}

export interface ProductSpecItem extends Struct.ComponentSchema {
  collectionName: 'components_product_spec_items';
  info: {
    description: 'Key/value row for technical specifications';
    displayName: 'spec-item';
    icon: 'file-text';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo';
  info: {
    description: 'Meta fields for product detail pages';
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonical_url: Schema.Attribute.String;
    meta_description: Schema.Attribute.Text;
    meta_title: Schema.Attribute.String;
    og_image: Schema.Attribute.Media<'images'>;
    schema_json: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'homepage.cta-button': HomepageCtaButton;
      'homepage.product-highlight': HomepageProductHighlight;
      'product.content-section': ProductContentSection;
      'product.feature-bullet': ProductFeatureBullet;
      'product.package-item': ProductPackageItem;
      'product.spec-group': ProductSpecGroup;
      'product.spec-item': ProductSpecItem;
      'shared.seo': SharedSeo;
    }
  }
}
