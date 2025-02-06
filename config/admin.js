// Function to generate preview pathname based on content type and document
const getPreviewPathname = (uid, { locale, document }) => {
  const { slug } = document;

  // Handle different content types with their specific URL patterns
  switch (uid) {
    // Handle pages with predefined routes
    // case "api::page.page":
    //   switch (slug) {
    //     case "homepage":
    //       return `/${locale}`; // Localized homepage
    //     case "pricing":
    //       return "/pricing"; // Pricing page
    //     case "contact":
    //       return "/contact"; // Contact page
    //     case "faq":
    //       return "/faq"; // FAQ page
    //   }
    // // Handle product pages
    // case "api::product.product": {
    //   if (!slug) {
    //     return "/products"; // Products listing page
    //   }
    //   return `/products/${slug}`; // Individual product page
    // }
    // Handle blog articles
    case "api::blog.blog": {
      if (!slug) {
        return "/blogs"; // Blog listing page
      }
      return `/blogs/${slug}`; // Individual article page
    }
    default: {
      return null;
    }
  }
};

// … main export (see step 3)

// Main configuration export
module.exports = ({ env }) => {
  // Get environment variables
  const clientUrl = env("CLIENT_URL"); // Frontend application URL
  const previewSecret = env("PREVIEW_SECRET"); // Secret key for preview authentication

  return {
    // Other admin-related configurations go here
    // (see docs.strapi.io/dev-docs/configurations/admin-panel)
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
    apiToken: {
      salt: env("API_TOKEN_SALT"),
    },
    transfer: {
      token: {
        salt: env("TRANSFER_TOKEN_SALT"),
      },
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },
    preview: {
      enabled: true, // Enable preview functionality
      config: {
        allowedOrigins: clientUrl, // Restrict preview access to specific domain
        async handler(uid, { documentId, locale, status }) {
          // Fetch the complete document from Strapi
          const document = await strapi.documents(uid).findOne({ documentId });

          // Generate the preview pathname based on content type and document
          const pathname = getPreviewPathname(uid, { locale, document });

          // Disable preview if the pathname is not found
          if (!pathname) {
            return null;
          }

          // Use Next.js draft mode passing it a secret key and the content-type status
          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            // slug: document.slug,
            status,
          });
          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
