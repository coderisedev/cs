import type { Schema, Struct } from '@strapi/strapi';

export interface BlogAuthor extends Struct.ComponentSchema {
  collectionName: 'components_blog_authors';
  info: {
    displayName: 'author';
    icon: 'calendar';
  };
  attributes: {};
}

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

export interface MarketingEmbedMedia extends Struct.ComponentSchema {
  collectionName: 'components_marketing_embed_media';
  info: {
    description: 'Hero media supporting uploads or external embeds';
    displayName: 'embed-media';
    icon: 'play';
  };
  attributes: {
    alt_text: Schema.Attribute.String;
    asset: Schema.Attribute.Media<'images' | 'videos'>;
    embed_url: Schema.Attribute.String;
    thumbnail: Schema.Attribute.Media<'images'>;
    type: Schema.Attribute.Enumeration<['image', 'video', 'embed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'image'>;
  };
}

export interface MarketingFeature extends Struct.ComponentSchema {
  collectionName: 'components_marketing_features';
  info: {
    description: 'Homepage release feature highlight';
    displayName: 'feature';
    icon: 'star';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    media: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

export interface MarketingStat extends Struct.ComponentSchema {
  collectionName: 'components_marketing_stats';
  info: {
    description: 'Key metric for release banner';
    displayName: 'stat';
    icon: 'chartBubble';
  };
  attributes: {
    description: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductDownload extends Struct.ComponentSchema {
  collectionName: 'components_product_downloads';
  info: {
    description: 'Support files or external resources';
    displayName: 'download';
    icon: 'attachment';
  };
  attributes: {
    external_url: Schema.Attribute.String;
    file: Schema.Attribute.Media<'files' | 'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductFeature extends Struct.ComponentSchema {
  collectionName: 'components_product_features';
  info: {
    description: 'Highlight block with heading, body, and optional media';
    displayName: 'feature';
    icon: 'layout';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    media: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

export interface ProductQa extends Struct.ComponentSchema {
  collectionName: 'components_product_qas';
  info: {
    description: 'FAQ entry';
    displayName: 'qa';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText;
    question: Schema.Attribute.String & Schema.Attribute.Required;
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
      'blog.author': BlogAuthor;
      'homepage.cta-button': HomepageCtaButton;
      'homepage.product-highlight': HomepageProductHighlight;
      'marketing.embed-media': MarketingEmbedMedia;
      'marketing.feature': MarketingFeature;
      'marketing.stat': MarketingStat;
      'product.download': ProductDownload;
      'product.feature': ProductFeature;
      'product.qa': ProductQa;
      'product.spec-item': ProductSpecItem;
      'shared.seo': SharedSeo;
    }
  }
}
