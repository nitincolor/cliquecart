type PreviewImage = {
  id: string;
  url: string;
  color: string;
  productId: string;
}

type IProduct = {
  id: string;
  title: string;
  price: string;
  discountedPrice: string;
  quantity: number;
  slug: string;
  updatedAt: string;
  previewImage: PreviewImage
};

type variantData = {
  color: string;
  size: string;
  image: File | null | string;
  isDefault:boolean
};

type AdditionalInfo = {
  name: string;
  description: string;
};


type IProductAllField = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  categoryId: string;
  tags?: string[];
  description?: string;
  shortDescription: string;
  productVariants: variantData[];
  additionalInformation?: AdditionalInfo[] | null;
  customAttributes?: CustomAttribute[] | null;
  offers?: string[];
  slug: string;
  sku?: string;
  quantity: number;
  body?: string;
};


type CustomAttribute = {
  attributeName: string;
  attributeValues: AttributeValue[];
};

type AttributeValue = {
  id: string;
  title: string;
};


export type { IProduct, IProductAllField };