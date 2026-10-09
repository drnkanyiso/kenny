# Dr. Nkanyiso Hugo site

The homepage contains Dr. Nkanyiso's supplied service descriptions and testimonials, edited for clarity. Spiritual beliefs and personal accounts are not guaranteed outcomes.

Service content lives in `content/services/`. Each service has a short
`description` for its card and full details in its Markdown body. The homepage
and `/services/` listing share cards that link to the individual service pages,
where a contact panel displays any configured contact channels.

Service artwork is generated with the built-in imagegen tool and saved in
`assets/images/services/`. The prompt manifest records each image's concept.
Hugo produces 640px and 1200px JPEG variants for responsive cards and detail
pages; full-size PNG sources are kept in the project.

## Run locally

Install dependencies with `npm install`, then run `npm run start` and open
the URL printed by Hugo (usually `http://localhost:1313/`). Hugo must be
installed and available on your PATH. For Tailwind class edits, run
`npm run css:watch` in a second terminal to regenerate Tailwind utilities.
Build with `npm run build`; output is written to `public/`.

The design uses deep purple, green accents, and pale lilac backgrounds.
Tailwind CSS is compiled locally into `assets/css/tailwind.generated.css`;
the generated file is retained so Hugo can also run without Node installed.

## UI verification

With `hugo server --port 1313` running and Microsoft Edge installed, run
`npm run check:ui`. This checks all pages at desktop, tablet, and mobile widths,
image loading, horizontal overflow, navigation keyboard behavior, expandable
sections, and reduced motion. Preview screenshots are written to `.preview/`.

## Contact and hosting setup

No domain, phone, email, WhatsApp number, or address is configured. Add Dr. Nkanyiso's confirmed details in `hugo.toml` and `content/contact-us.md`. Set `baseURL` to the final domain before deploying. Contact actions and the email form appear only when the corresponding details are configured.

The static form opens the visitor's email application when a recipient is configured. It does not send or store submissions on a server.
