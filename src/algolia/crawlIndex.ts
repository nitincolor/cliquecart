import algoliasearch from "algoliasearch";
import { load } from "cheerio";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

const client = algoliasearch(appID, apiKEY);
const index = client.initIndex(INDEX);

export const structuredAlgoliaHtmlData = async ({
  pageUrl = "",
  htmlString = "",
  title = "",
  type = "",
  imageURL = "",
  price = 0,
  discountedPrice = 0,
  reviews = 0,
  category = "",
  colors = [] as string[],
  sizes = [] as string[],
  id = "",
  tags = [],
  description = [],
  thumbnails = [] as {color: string;image: string;}[],
  previewImage = {} as {color?: string;image: string;},
  additionalInformation = {},
  customAttributes = {},
  status = true,
  offers = [],
}) => {
  try {
    const c$ = load(htmlString).text();
    const data = {
      objectID: pageUrl,
      name: title,
      url: pageUrl,
      shortDescription: c$.slice(0, 7000),
      type: type,
      imageURL: imageURL,
      updatedAt: new Date().toISOString(),
      price: price,
      discountedPrice: discountedPrice,
      reviews: reviews,
      category: category,
      colors: colors,
      sizes: sizes,
      tags : tags,
      id: id,
      thumbnails: thumbnails,
      previewImage: previewImage,
      additionalInformation: additionalInformation,
      customAttributes: customAttributes,
      status: status,
      offers: offers,
      description: description,
    };


    await addToAlgolia(data);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in structuredAlgoliaHtmlData", error);
  }
};

async function addToAlgolia(record: any) {
  try {
    // Skip Algolia operations during build if environment variables are missing or insufficient permissions
    if (!appID || !apiKEY || !INDEX) {
      console.log("Skipping Algolia indexing: missing environment variables");
      return;
    }
    
    await index.saveObject(record, {
      autoGenerateObjectIDIfNotExist: true,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in addToAlgolia", error);
    // Don't throw the error to prevent build failures
  }
}

export const updateIndex = async (data: any) => {
  try {
    // Skip Algolia operations during build if environment variables are missing or insufficient permissions
    if (!appID || !apiKEY || !INDEX) {
      console.log("Skipping Algolia update: missing environment variables");
      return;
    }
    
    await index.partialUpdateObject(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in updateIndex", error);
    // Don't throw the error to prevent build failures
  }
};
