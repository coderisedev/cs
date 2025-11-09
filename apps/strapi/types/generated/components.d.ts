import type { Schema, Struct } from '@strapi/strapi';

export interface BlogAuthor extends Struct.ComponentSchema {
  collectionName: 'components_blog_authors';
  info: {
    displayName: 'author';
    icon: 'calendar';
  };
  attributes: {};
}

export interface MarketingEmbedMedia extends Struct.ComponentSchema {
  collectionName: 'components_marketing_embed_media';
  info: {
    displayName: 'embed-media';
    description: 'Hero media supporting uploads or external embeds';
    icon: 'play';
  };
  attributes: {
    type: Schema.Attribute.Enumeration<['image', 'video', 'embed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'image'>;
    asset: Schema.Attribute.Media<'images' | 'videos'>;
    embed_url: Schema.Attribute.String;
    thumbnail: Schema.Attribute.Media<'images'>;
    alt_text: Schema.Attribute.String;
  };
}

export interface MarketingFeature extends Struct.ComponentSchema {
  collectionName: 'components_marketing_features';
  info: {
    displayName: 'feature';
    description: 'Homepage release feature highlight';
    icon: 'star';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.RichText;
    media: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

export interface MarketingStat extends Struct.ComponentSchema {
  collectionName: 'components_marketing_stats';
  info: {
    displayName: 'stat';
    description: 'Key metric for release banner';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.String;
  };
}

export interface ProductDownload extends Struct.ComponentSchema {
  collectionName: 'components_product_downloads';
  info: {
    displayName: 'download';
    description: 'Support files or external resources';
    icon: 'attachment';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    file: Schema.Attribute.Media<'files' | 'images'>;
    external_url: Schema.Attribute.String;
  };
}

export interface ProductFeature extends Struct.ComponentSchema {
  collectionName: 'components_product_features';
  info: {
    displayName: 'feature';
    description: 'Highlight block with heading, body, and optional media';
    icon: 'layout';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.RichText;
    media: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

export interface ProductQa extends Struct.ComponentSchema {
  collectionName: 'components_product_qas';
  info: {
    displayName: 'qa';
    description: 'FAQ entry';
    icon: 'question';
  };
  attributes: {
    question: Schema.Attribute.String & Schema.Attribute.Required;
    answer: Schema.Attribute.RichText;
  };
}

export interface ProductSpecItem extends Struct.ComponentSchema {
  collectionName: 'components_product_spec_items';
  info: {
    displayName: 'spec-item';
    description: 'Key/value row for technical specifications';
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
    displayName: 'seo';
    description: 'Meta fields for product detail pages';
    icon: 'search';
  };
  attributes: {
    meta_title: Schema.Attribute.String;
    meta_description: Schema.Attribute.Text;
    canonical_url: Schema.Attribute.String;
    og_image: Schema.Attribute.Media<'images'>;
    schema_json: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blog.author': BlogAuthor;
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
