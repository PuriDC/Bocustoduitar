/**
 * Every editable string and image URL on the public site.
 *
 * This is the single source of truth: page components read from it (through
 * `usePageContent`) and the admin panel builds its form from it. The database
 * stores only the values an administrator has changed, addressed by the dotted
 * path of the leaf — `models.series.0.name`, `gallery.banner.image`, and so on.
 * A field that has never been edited simply falls back to the value here, which
 * is why the site still renders correctly with an empty (or unreachable)
 * database.
 *
 * Adding a field here makes it editable; no schema change is needed.
 */
export const defaultContent = {
  common: {
    brand: {
      namePrimary: "Bocusto",
      nameSecondary: "Guitars",
      languageToggle: "EN / TH",
      cartCount: "2"
    },
    nav: {
      about: "About",
      models: "Models",
      available: "Available",
      order: "Order",
      gallery: "Gallery",
      events: "Events",
      contact: "Contact"
    },
    footer: {
      brand: "Bocusto Guitars",
      links: [
        { label: "The Luthier's Process" },
        { label: "Tonewood Selection" },
        { label: "Maintenance Guide" },
        { label: "Privacy Policy" }
      ],
      copyright: "© 2024 Bocusto Guitars. Handcrafted Precision.",
      topLabel: "Ascend"
    }
  },

  home: {
    hero: {
      eyebrow: "Excellence in Resonance",
      titleLine1: "The Soul of the",
      titleLine2: "Luthier's Craft.",
      body: "Hand-selected tonewoods, surgical precision, and a relentless pursuit of acoustic perfection. Every Bocusto instrument is a unique dialogue between wood and musician.",
      primaryCta: "Explore Models",
      secondaryCta: "The Process",
      scrollLabel: "Scroll",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAxzxcfcGjzGLdUyChDqBi2VxQNXHXneJrQlPh5_VHhuFNIyX7lkpItCf1at-NLDVaU70vhZBSpbjV04ZvfzJ4415I3A6F5DGm_uQVTDPecyukjkgo3xOVKsyDjkikrlTDqRtefFlvqtQdPXuLF15m4PJM_1j66tDjY9_fd23GXbYqDjFi9z4oHch8z37GdTBKWhvZMy-h2FKNNVv-VEhxlZKDVO88eTwDaQy2e0Ut6Z9aBRbUpgPRRJ23kQRypv5A7cl9SNNCf9cE",
      imageAlt: "Close-up of a boutique acoustic guitar showing dark tonewood grain and a polished amber finish"
    },
    philosophy: {
      eyebrow: "Philosophy",
      title: "Honoring the Spirit of the Wood.",
      body1:
        "At Bocusto, we do not simply build instruments. We curate vibrations. The philosophy begins in the forests, where only the most resonant specimens of Sitka Spruce and Brazilian Rosewood are selected.",
      body2:
        "Each guitar undergoes a two-hundred-hour transformation. Our approach rejects the mass-production line, favoring the intuition of the human hand and the precision of the trained ear. We believe that a guitar should not only play beautiful notes but inspire them.",
      badgeEyebrow: "Est. 1994",
      badgeTitle: "Artisan Built.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqXjPiqQYgogSMKDX4IZN_JRlPSZtwnMJ34i8zlj6WRJ11CEcn19cL9GMJ2ajNkQ-zy9ZBo4iVdogHqbVlxFZXBHRgaiouZHlzLGK4UFnzepbNbaJ62BAUU5SYnjokYuv8hVfkamqyQPiK4L_25NABMADyDFBLNyFI-QonyfUhIOWh9sR5G4MHFY2EGL2tRtYDiDFdi76fhJrfUfVg9Vim7l2Nm_KkmVp3-vul_A19lH7EwIk7x3y2DKJXManNdPS8DhsCGPv5r3s",
      imageAlt: "An artisan working on a guitar neck in a dusty sunlit workshop",
      pillars: [
        { number: "01", label: "Harmonic Voicing" },
        { number: "02", label: "Organic Varnish" },
        { number: "03", label: "Hand-Carved Bracing" },
        { number: "04", label: "Custom Inlay" }
      ]
    },
    featured: {
      eyebrow: "Current Availability",
      title: "Featured Build",
      viewAll: "View All Available",
      badge: "One of One",
      model: "Model 24-B",
      name: "The Amber Resonance Dreadnought",
      cta: "Request Specifications",
      craftLabel: "Craft Details",
      craftDetails: "Sitka Spruce top, Brazilian Rosewood back and sides, hand-carved scalloped bracing.",
      acousticLabel: "Acoustic Engineering",
      acousticEngineering: "Bone nut and saddle, hide-glue construction for maximum resonance transfer.",
      mainImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCbGPPvi8ZzmSHVSS2D10eWkbJLKs51yGcGdLZ9Zy5WytbsZxwBUwSN9VJFaqV7gn-w9GfXibWd6HtDDycUw9z18AFZD6gOpeCBz_ZC4-h-c_Ug5VXt1HslljXMad2SZ6tlYoPBEKH-r35PwjqyQzllpdKy5bTzo-HbU9ciVrScVfL6nwwgSm7n2bURzEfdk88hEqTRpObtQhFr7jkvVksq7LkZlh-nLF5mPPaj2pVPd5C2_MEsYzegRvO8MLUmX7WY8n6EEX-X9do",
      mainImageAlt: "Full view of a luxury acoustic guitar with ornate inlay",
      craftImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBvPXoo59OPUUBMSMzaFXB3-tvZUSEUXBxlRYGrYaVkKNCW5ku3R3gWB8PrMsvVXP4fSaNvNQOx9_qiOxKIVMVHXqxEp2OQeKBEOryXGbEz6ks701xdjy0gM6Rntj2iDiQsEmylQdxQo4gmBlre-XgZfPRKNKlbyxJvrXvtLigi1Se4mT1bZl3Kg5wIi7o8ZLIFZsiVMoqzdxBQaRl-9Zo17n1RMLMlqJ_bvdzO4S3ClpPITsfEvI4DVaw3DkQkSojsFfKBhCJnILg",
      craftImageAlt: "Guitar headstock detail",
      acousticImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBStl2Q75_IvvbfkfGwHrlx3WpMdX-OPVnsjQoidQnLCFBEq3wH0B3xMoHbq9o0_EC-bnE61_haWoJS6aOb9oQUt3wXEI8lyp1Le-j8_r6tTw0Z8DyglEJ1c85t3GizR7aLdxmc0w456cn8tS1cScn7Qq_RS0VK8ZXh4NSYiSdYvewwlLjKjHjdcRWYoF4NaEFAR8cTkWjrmqMo-wi5g6T6BQH5GQpGSdCuCkWYK1o4CFiUIg12-UX6VgYhyj8jkk0YTTtalFbrvsw",
      acousticImageAlt: "Guitar strings and bridge"
    },
    stats: [
      { value: "30+", label: "Years of Craft" },
      { value: "200", label: "Hours per Build" },
      { value: "12", label: "Tonewood Species" },
      { value: "1:1", label: "One Luthier, One Guitar" }
    ],
    newsletter: {
      eyebrow: "Private Access",
      title: "Join the Inner Circle.",
      body: "Receive quarterly updates on new tonewood acquisitions, private gallery viewings, and upcoming workshop builds.",
      placeholder: "YOUR EMAIL ADDRESS",
      cta: "Subscribe"
    }
  },

  models: {
    hero: {
      eyebrow: "The Collections",
      titleLine1: "Instruments of",
      titleLine2: "Enduring Character.",
      body: "Our models are not merely products, but chapters of an evolving acoustic narrative. From the foundational Origin to the bespoke Signature series."
    },
    series: [
      {
        chapter: "Chapter I",
        name: "The Origin",
        specsTitle: "Technical Essence",
        specs: [
          { label: "European Spruce Top", detail: "Sustain focus" },
          { label: "Hand-Carved Bracing", detail: "X-Pattern optimization" },
          { label: "Nitrocellulose Finish", detail: "Organic breathability" }
        ],
        blurb:
          "A refined introduction to the Bocusto sound. Designed for clarity, projection, and the nuanced response required by modern fingerstyle players.",
        cta: "View Details",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBtXWbPtec8Dvtpxm6pOyQgwGXqfUb5NGA-oIWmuPKPDClNHGUHFemTv5_1ii_lkprTpGfuqPFKzEZMj3Bz3k1jWbdEJReQMh67CPd_yFvVbXPOwOWOY2yRci3qegJ9GiYpALKDLqPyQQq6Y2ZpmzlWLYcejK_cNiDMvcP8yWnHeeZXi6PGVD8gSpAhawjsBOHkrCpCYEwBdzMDZNxW_jZEzEZV_y3pZ65BOmfH_sefpehM1Gf2Uf1FWPQN24GZ5cVuXJQi3BclDjU",
        alt: "Close-up of a boutique acoustic guitar in light spruce and mahogany, dramatic side lighting on the wood grain"
      },
      {
        chapter: "Chapter II",
        name: "The Masterpiece",
        specsTitle: "Structural Integrity",
        specs: [
          { label: "Master-Grade Rosewood", detail: "Aged 40+ Years" },
          { label: "Ebony Fingerboard", detail: "Surgical Precision" },
          { label: "Gold-Leaf Rosette", detail: "Visual Resonance" }
        ],
        blurb:
          "Where the luthier's art reaches its zenith. Each Masterpiece is a singular expression of acoustic physics and visual poetry.",
        cta: "View Details",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDLf9M-pgDtLWJch8uluQKEv1ArUb1bZd1L-jfksnjKSberzEQm8JS7v1xbDPI_CZJlAiPRL2mDIdtnlQZbzskb-MxMey922QRIv-LT1hNBW6i_883wDCaeVSdMYc7PgvXs243RcJlU7QWpKHVxLyqFgoX7aVmMci7nKLcdRDMqpTrUnc5siP5Hu0c4qaFh9SWK7lxZJjFjtgyfbEzpusnHMmKG9JeFk3AjZ3YrAejbj21zrwjV7pnfiLMzoQGv4eUrTgtlX3z0kdQ",
        alt: "Back of a high-end acoustic guitar showing intricate dark rosewood patterns with a mirror finish"
      },
      {
        chapter: "Chapter III",
        name: "The Signature",
        specsTitle: "Artist Collaboration",
        specs: [
          { label: "Custom Scale Length", detail: "Ergonomic focus" },
          { label: "Soundport Inlay", detail: "Player monitoring" },
          { label: "Mammoth Ivory Nut", detail: "Heritage materials" }
        ],
        blurb:
          "Built in collaboration with world-class performers to meet the rigorous demands of the stage and the surgical clarity of the studio.",
        cta: "View Details",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDEvN957fGFlktKesI6wT9lAVX0u4SFEZMR18v6C60I5N_UrRjeKHsq04amvE2nnfWZm3vorIR3OC6YMoq8H57D5eFw0PoNpLJOAkU7QSv_lI6LkEnt_Lm81x0G4047te-mbSs2DUvJbyNRmVVkGfJ9UdfkDjb2SpNGFvHqPc2lfcc1SVnmmvmor7-kPrQNFw60jvBl9_4-bLtBO2tI9SwFg6AxiOKoehJNEa3qSdxk1EkgQGxqHzZVlX62tGj1irOO2LjPvopHQn4",
        alt: "Guitar headstock detail with brass tuning pegs and a gold-inlaid logo in warm amber light"
      }
    ],
    cta: {
      title: "Find your unique resonance.",
      body: "Every Bocusto guitar is a collaborative journey between the luthier and the player. We are currently accepting commissions for Q4 2024.",
      primary: "Inquire Now",
      secondary: "Download Catalog"
    }
  },

  available: {
    hero: {
      eyebrow: "Current Inventory",
      title: "Ready to Ship",
      body: "Exquisitely handcrafted instruments, currently available for immediate delivery to discerning players worldwide."
    },
    inventory: [
      {
        name: "The Ember OM",
        price: "$8,450",
        badge: "In Stock",
        spec1Label: "Top Wood",
        spec1Value: "Sinker Redwood",
        spec2Label: "Back & Sides",
        spec2Value: "African Blackwood",
        cta: "Inquire Now",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCwYeUOmuzpNe393EfQZK5FXD-X39oiN3TUAQ49Pu4wfyOUmGo3jQooIzvgodbWBtjjZlt89cxwBMfvL3rk4mhWPlzT5HTg1-_Z2mbxfsvUUBY9GF8QMPO46ATDR9jG-ELJ1x1s6MHmIcFCjrjkjD9-ghKPtZbFhHVLzaEB92zh8MAK3rKw2crDoGehJLZZmgzzO6e3G-OK1tVVJiyAD4PxV5_22DE73fn2U7BUd7W1-WMwlb9ybZpEbHzEfrGBCw7Rc5x2aoKysOs",
        alt: "Close up of a bespoke dark wood acoustic guitar with amber varnish highlighting the grain"
      },
      {
        name: "Midnight Archtop",
        price: "$12,200",
        badge: "Featured",
        spec1Label: "Top Wood",
        spec1Value: "European Spruce",
        spec2Label: "Hardware",
        spec2Value: "Hand-Aged Brass",
        cta: "Inquire Now",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuABWcNlBiXEHjkIjJoHO2hy15d_z3fA8YHINyti54CcwMZVhFm5cmhDq1VuqIDrDvAyV63Yojw2aRnyMaY946Xe9xki2xGK29fYbxinDIOOe-EzdvuU3FoDsPJDtcTLL1m03iQXJH400kTcZUx43waWQt3OdkyVcCOrI4iyoklabCzKVvtxPGSBH3zFJ1T0zc8I8BmJJmM7YCi7Wy44BYKoPN-mCstQRcyi-CqIw8UDjutXE9Pa68r1Yy2QJgdHt9-kh0zacXuTyT8",
        alt: "Boutique hollow body electric guitar with gold hardware and a deep honey burst finish"
      },
      {
        name: "Aurora Parlor",
        price: "$6,900",
        badge: "",
        spec1Label: "Top Wood",
        spec1Value: "Torrefied Sitka",
        spec2Label: "Inlay",
        spec2Value: "Abalone Vine",
        cta: "Inquire Now",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBebpjxHr9X4L11B8Mix0Xkeh0RdeeyJuEuQkz_ignVYgtPbIGIk5JYuWtl8MyXUx-vQ6tQEuSy7d_jFPvbB7QXLzlY9z2E1CTyV885luDceJbNRU_qcQgGs2BcEk6TwtsQ6vN50wGgTAOKWVpRx-v9Ckm8knZW4g9l3DEVtjZGHyQiWMS1nABBpWIuLw1zc6AIs5oU5EY2WV5P0_gjsEDLZsUsFXAZ_IJHBtIdjGStEeXq2CvE64YPgH219p7emfHTFZRCFOWR5X8",
        alt: "Macro detail of a guitar fretboard with abalone shell inlays and polished nickel frets"
      },
      {
        name: "Tidal Dreadnought",
        price: "$9,100",
        badge: "",
        spec1Label: "Top Wood",
        spec1Value: "Adirondack Spruce",
        spec2Label: "Back & Sides",
        spec2Value: "Quilted Mahogany",
        cta: "Inquire Now",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCoEiAsc2_xPM74zW4mHACKcLyYk037f5mCKwktkYN95snyyrJzbSieFLQ9k1VqCtyCIIJJhqK9iicrlm4XaftiFe92tYmXYWI_NMc_swsQsRE2ENPagNRAiJeTEUylTpBo-6j54o8MuUp8a921O5mkMC0wUxUIGvQgKF9qqYXMMWty82pS1F3uGU_D2zmmcHazQC8rDvMJWLsZ-NUPQ_ZlqfUde-xZ1GSA4qa6VasD5tzO1nOdxTSfdiHK8SlpZsuNbZxgD05Dx6k",
        alt: "Close up of an acoustic guitar bridge with elegant bridge pins and a warm natural finish"
      },
      {
        name: "Eclipse Baritone",
        price: "$10,500",
        badge: "",
        spec1Label: "Top Wood",
        spec1Value: "Western Red Cedar",
        spec2Label: "Scale",
        spec2Value: '27" Multi-scale',
        cta: "Inquire Now",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD10gbeWnAnZfSw5R7-hx6eaHEW91rCGKbVJdd4AqlnPAJRTneHxnh8o0uC_Yj5upgXog2XPovtnjtpBL5xWl1E5QriNHnhwchj_1DmYV3l-PQ_iecBWFrNG07VITYUFglEFZS6v4j-JuRYRzMcmN0H9nPyfFhlTzkDEqkdvp-0bFwKfYnpyr2m5pzIU0H7YnXxwjwLHySQn-c2SZ1MzO0DrGun0Kb6G6TxcV3k3BFQatLr3M3lCjk_GGKSrf4HfygW2kpVZlAr5w8",
        alt: "Headstock of a premium guitar with precision tuners and a minimalist wood inlay logo"
      }
    ],
    commission: {
      title: "Commission a Custom Instrument",
      body: "Don't see exactly what you're looking for? Work directly with the luthier to select your tonewoods and specifications.",
      cta: "Start Commission",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCGjNRzBJLBXSjfN6HT-TE4dSf805QvhNxfFTsrvJPaBb6vUjsGpdwzWUTIUj7TkOwLvVJwL__lnyseCmvK6V2KsJSNlvTSbPfu-yzRAUIHaRpYVMrg24v-ayG18vbmXv5KmQf_J_wMfhACbIrY_wYuUWKIUGmOgmcokAPX2Jn2_IChibjcNrW2Tb0FoVLnLfUgA6Lxy37Wghb_Dd0ikfN1IUqC9fHg6VsxIbRk57bfnKy6bO3F3b-s11gd1lz_oCtewlDG_R5eLCk",
      alt: "A luthier shaping a guitar body in a workshop, surrounded by wood shavings and hand tools"
    },
    newsletter: {
      eyebrow: "Stay Informed",
      title: "Receive Early Access to New Bench Releases",
      body: "Inventory moves quickly. Subscribe to our studio log for first-priority notifications on new available instruments.",
      placeholder: "YOUR EMAIL ADDRESS",
      cta: "Subscribe"
    }
  },

  order: {
    hero: {
      eyebrow: "Commission an Icon",
      titleLine1: "The Architecture",
      titleLine2: "of Resonance",
      body: "A Bocusto guitar is more than an instrument; it is a collaborative legacy. Our commission process is a journey through acoustics, aesthetics, and personal expression.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDK_xiSHSQj1TNt2ZsBXrxzZsc1NNdjBGQliJOMod87xtxJrHylhBjZH4fT1-cgBIX8nwJl99C7YjC46cuptERRH2uvbyXkAlN6Wl_fMVMLtVdILcwqZDJLPDsrB0CWszSFs4RjB0Cqa77YvSdcgApbxWdGBJ14CAnKW6_yGxAiXWzQfd5Wy2g-5vT18DJq6GO6lA37PCbAqyKMS1qcMlJNndYIm7rJMSaTWni8BnGdhabuqkX511mi5iof-jevabhIL51S83QYIlU",
      alt: "Luthier's workshop with wood shavings on a dark bench and warm light on an unfinished guitar body"
    },
    phase1: {
      eyebrow: "Phase 01",
      title: "Consultation",
      body: "Every masterpiece begins with a conversation. We discuss your playing style, tonal preferences, and ergonomic needs to define the soul of your instrument.",
      tag: "Audio Profile Mapping"
    },
    phase2: {
      eyebrow: "Phase 02",
      title: "Design & Selection",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA4LkW7BfAR1P17Xh8xQOVImkWLCV2tIcddv1NBSQ239R743P_rA77yO8H2jYtYIPPViuyTYxOvdfsl2qkTM_k6bnsSRQbnWEjlebCYuEfLcQVcoMZ8J-PQWPcy5tmxT_symGk0a0IIyOzKiIZ-AzQTNQVHAElPjArQJmgxkwKSXxOgaAdoYDyzhZKTUeRmFS2xD-7M-vT4EDH7-op_KbsXaRTi_PVyStNof7Vcui5piiwaOqlvod0XtQAqVQRZx-VbhAIUvFY7vw8",
      alt: "Exotic tonewood samples including figured maple and dark ebony under precise lighting"
    },
    phase3: {
      eyebrow: "Phase 03",
      title: "The Build",
      body: "Meticulous hand-carving and precision assembly. You receive fortnightly photographic updates from the workshop as your vision takes physical form."
    },
    phase4: {
      eyebrow: "Phase 04",
      title: "Delivery",
      body: "Hand-delivered or secured in custom flight cases. Precision-tuned and ready for its first note.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBvTHcVRXg0_56aBrRSdMh06E1-1MpOpz8wRR6t37MkDVI4-gMPbOfnyoKP5X_5pmiQno03oE5nG59QvK2FuGkPZQTuDau2lcWGhVdaqj49uOmU8JyMMti2tsBJxauAkkScNb8tLkRJEwWVLf_JX8752NCXa9wCH-8QSVPWdlmePRonLgae3xmkcWOqjkMS8b7y_YXSDDX8OwFX_SOja37JezTt_eHb0CwEW65QrOUQHg8qxZe5XbiNd2u_KxVzjdob5yQ97cDAeKg",
      alt: "A finished acoustic guitar resting in a velvet-lined hard case in a dim studio"
    },
    form: {
      titleLine1: "Start Your",
      titleLine2: "Commission",
      body: "The waiting list for custom builds is currently 14 months. Reserve your slot today with an initial consultation.",
      email: "studio@bocusto.com",
      location: "Florence, Italy",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      modelLabel: "Preferred Model / Style",
      messageLabel: "Tell us about your sound",
      submit: "Initiate Process",
      models: [
        { label: "The Artisan Archtop" },
        { label: "The Resonance Dreadnought" },
        { label: "The Studio Parlor" },
        { label: "Fully Custom Concept" }
      ]
    }
  },

  events: {
    hero: {
      eyebrow: "Calendar of Craft",
      titleLine1: "The 2024 Global",
      titleLine2: "Exhibition Tour.",
      body: "Experience the resonance firsthand. Join us for intimate workshop tours, prestigious guitar exhibitions, and masterclasses across the globe."
    },
    featured: {
      eyebrow: "Signature Masterclass",
      title: "Acoustic Resonance & Bracing",
      body: "An intensive two-day exploration of soundboard mechanics led by our master luthier in the heart of Cremona.",
      primaryCta: "RSVP Now",
      secondaryCta: "Learn More",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBlxg2RLfQn0SBO88t9YXmTbLM8ulGnpwQQktgKOcViBtA0n1at0JpFGhLox8MSXdzxEYhK8u3ZwQ8KNoOdwaUHDPoCjF81BVVi7QGxbGQlx8G1FG6yoHh-lPWnFnZOUtmbiJ0K4xhqHqej7qyA_EcMtOQOgyXwRSAd0J76nH119UjlnrQKh6y0O70gwzse4ODJ5IJzCbteJWRohva8y8kq4hEo8K-sTaEYa5I7xdvxuHLt7zpFQuw02eAEGvjWSwmBCgPl4QXgPx0",
      alt: "A luthier hand-carving a guitar neck in a workshop lit by warm golden light"
    },
    location: {
      eyebrow: "Location Highlight",
      name: "Cremona, Italy",
      dates: "Oct 14 — Oct 16, 2024",
      body: "Limited to 12 participants. Includes private access to the Stradivari Museum archives.",
      cta: "View Logistics",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAwA9-wcENWzsKdpQmFAoyvT0Nr8TIETI6BiTiuLPDs-6Z-cWX8HgITbGZOXRuL6hq6V9cdV_c-Y4P5zePTPIrStntobJHnWCV_XjYFBdn44OwQh461y5ZqrEesNIoQpV7OScM9DKje11W5aXDJfn4I-v-dTjRXzWCcbLHcB0C67UdoYEP6DcFSFdB8kUIu-4Oe5g5EfQYFjyfj0OFzX8LfcQN7X8Ab07ZDO75oXcSjMH8SJ8FbYfyTF5f4gQjQGsf7-kbLAbaZRg",
      alt: "Abstract map of Cremona, Italy rendered in gold and dark amber tones"
    },
    list: {
      title: "Upcoming Dates",
      allLabel: "All Events"
    },
    events: [
      {
        date: "Nov 02",
        city: "Berlin, DE",
        title: "The Holy Grail Guitar Show",
        blurb: "Presenting the 2024 'Aurora' Collection at the Estrel Berlin.",
        category: "Exhibition",
        cta: "Learn More"
      },
      {
        date: "Nov 18",
        city: "London, UK",
        title: "Luthier's Roundtable",
        blurb: "A symposium on sustainable tonewood sourcing and aging techniques.",
        category: "Conference",
        cta: "RSVP"
      },
      {
        date: "Dec 05",
        city: "Tokyo, JP",
        title: "Bocusto Asia Preview",
        blurb: "Exclusive unveiling of the Limited Edition Cherrywood Series.",
        category: "Workshop",
        cta: "Book Private"
      }
    ],
    past: [
      {
        title: "Past Exhibition: Paris",
        caption: "Spring 2024",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCW6xr0jutMJqpyq-Ac7jmXFBoIRHc-PkwR9DIyd-uRfaUG33CFWU5WfhNtqJFCv11sBvUIzQPJbm3JSgfDj_aw707JrLr8Nn-KWGfQqbaNwUOde8snNU_QHlw34XKfUcaCC-Bm_nibASCSuvWpM9R9NCBbGCh5bZMSd1zTg8PQTcaDo9qxDqj-Tt3Gw1JcabdTdZJNgK00RdMikAOFwTwE0UmvpaVZr2jBHEgwu4TqYo5L94Kl2KcBA1dTpiUr4QrutRyFT4EEleM",
        alt: "Interior of a luxury guitar exhibition room with spotlit instruments against dark walls"
      },
      {
        title: "Workshop: Nashville",
        caption: "Winter 2023",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAFPrH0UzL5c3WVWeMgD2uy9NM5eSTocvvdFUDnwaLTkuc-f6uh9eWm1bi4SpfAFPGHir9g9HBLNBMmnx_1551WXhDgALoQkfn9kzvxmenCMbw5gIp7cQ9LrRsYfEjJHQNuVT47XFBUhOwOPHjMaWce2UlGdnc_zkScMjpkkdEQQlAm1m1jmdfZiEMz3III14FNIj6WOolF96trDnpcAfsnshA3vDkgaqVe6Lr-8nDFDkRDfZglsY1RC6sZX_DafyIxstnjyiXT7ts",
        alt: "Guitar tonewoods leaning against a workshop wall in soft ambient light"
      }
    ]
  },

  gallery: {
    hero: {
      eyebrow: "Visual Archive",
      titleLine1: "Resonance in",
      titleLine2: "Form & Grain",
      body: "A curated collection of instruments, each a distinct chapter in the pursuit of sonic perfection and aesthetic grace."
    },
    plates: [
      {
        category: "The Process",
        title: "The Luthier's Hand",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBeC2WCIqo02yUfuOh4c6DbDdJ-4u56Ewc9L58r-eR9VO-BmI_9B0xWZEqFu1Nm5YV0cEGHTjwoWnMFsvph7-ocKliLCaZy-5AAAUp1eKtA4fZ705dCjTaxBADdOVwl7W6Ntr0jbXyfcS3Lo_EylkcBAq8bwS6LoYymdI9PSwppf04G0J_CqhT2tthqzKYfqUf95CbQP9axVKlU7anWboSevDGG4celCbybYk663IOXzvSegtVC8uGmUicWpB46wZot6boDuUWVUAg",
        alt: "Luthier workshop with traditional woodworking tools and fine wood shavings on a dark bench"
      },
      {
        category: "Model 01",
        title: "Spalted Maple Archive",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCl8YyN7XCFHZpJuy-nzoNuO-gVGE_h1-q3nYQCRrRTH_emclnUg6mmoQpTxzpMo5zOLsuFDODk8vUAAq2I48llCcMeAi6-u8rzUNw2osGbo8Kf3fZebgX2aNLEGUYhNGXbqODMsPbd0r9kLL9GeeJn12ReuBPq97eG4HDp_bFIk0Y8KnFoKKOqrawBn_9Zg0ebPEYdbET_YXNV3g00CmGGBmVzzBXNh2sj9ftZibNqhufN39We0UKWg5Sn2p0Fn_URYpiAUzEvc9E",
        alt: "Custom handcrafted acoustic guitar with tiger maple back under dramatic studio spotlighting"
      },
      {
        category: "Texture",
        title: "The Soul of the Tree",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAHO4C_Hrlxtda2udrwDba4U8g_TLiNulqyiL9kR0eTtMz1D0xO4je-WB2fpgCLHe-cDDj8MKmIdeOGsUW03leXytVzn2K_c9PkUtWL4xDlkDniLOiBhMUY7KN0sS8jRWIctCXxh--VL4iP3kTDNJgezt3K6EKBk7HkKRXPWZz6sZdBrV2WvVeqeXWmRhoOd0jeDb0ZuNhOOOvWHMUNLkEMCwVm0B_D8FQm5UUiF3JoEQRN7z0bYF2YZFoPpDPNdcDdNIVDx_U5G2k",
        alt: "Macro photograph of figured master-grade tonewood grain glowing under golden varnish"
      },
      {
        category: "Precision",
        title: "Brass & Bone",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBBzn_TdOTmAZ1T0WTxQvz7lxzYCqkgz9bpwC7yZCZlgUO-Zav87BlNvFx4kfFZD4ZS_63XlSS5I_CLr-NDzmPOv1XJQXL9L1oYddmSfbwrgOyvVC-1Kc3XPy6hI-_LQyjXM0q3-BzO56lYHpbMYGcvk9hmG-A4eYv2cMCA80xmOonDmFM0hCDpuw5aSrJftFzjPYkJMN8Kn-06PQ-7uIKND7nia0_ryvOwPmT_SQ-svDy5gkrQGzMwFeNu5_6S3cyHBGBMdH3Ok-4",
        alt: "Brass tuning pegs on a dark ebony headstock with pearl inlay in dramatic shadow"
      },
      {
        category: "Environment",
        title: "Midnight at the Bench",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDjw9a1fYabsv4pipJQAje5Xewk31G3KOePsKESl8H2DO6NDzgs0VIUG4Pgonc98Avaw0ON66R-KXRDDS8p6onPSZmWao3gRJEAf5eOfmm9BWfygqmdsCCRWxUY4kp8iVkukS-tIcd2ieH7__LAojjgsIEtbP1ekt9OICFtIPP-ppYrVO18JoNGnmmVJVdIo8GVJTYZ7ZEHEuY2Dlc5ULLnrqL6lxHNeh5KYtOE-FdkNwGPxccOXaJ7U_-CqPI3qBopObB-z9-k5tk",
        alt: "Artisan woodshop at night with a warm pendant lamp over an unfinished guitar body"
      },
      {
        category: "Aesthetics",
        title: "Form following Sound",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAWYWnrE2plYRqw3d7YRS5orpx-_JJW5n-LqlKXWneLwdi6LpSDWyjzezMGKw1UGcV5DHWSK4V4NIUU4WgLJoGGT8gximG6pIIajFOOvqyhn43OcQHcfb9G5EvApuV7QPoRFHFsgqEfSRQKtrSHSRe90fSuhjs_wz_S5GcPpClq1Q9pbXEJjeVsXDi7VqdEoBLktPajUnun22AteiGSEs0CmnBHMZXVqkcO0CM5WXDtgSaO1yopxCSrpUNfMbl9gyCiYqstsN6OZNs",
        alt: "Side profile of a polished guitar body curve showing the depth of nitrocellulose lacquer"
      }
    ],
    banner: {
      title: "Ready to define your own sound?",
      cta: "Inquire for Commissions",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCPGCehrWuQSHCD8mrIdCzQl_wQ3v58PaaT6OjeGnEm_ScKaTludCOGroyDfX5efIDRJayLKE-QicJeuFBUTFWRe61g7AjPC1Tc8z81sRFG1fk11s5KMosx0qbfX4xGYMgAqwSzWw9zTxh3Mcy5fOI2_AwirPUXZiQgZS2yhMOm0SZVgrodeJVf8Jyw_IEjpimwWUkgyjeQoViOTT_5X_NnByE6M3V1X_knTsDvTKbBAGiUPvKqo7zCXgTvp0x08aXdl5ukaFgQtuk",
      alt: "Extreme close-up of guitar strings above a dark soundhole with warm golden wood texture"
    }
  },

  about: {
    hero: {
      eyebrow: "Est. 1984",
      titleLine1: "Resonance",
      titleLine2: "Defined.",
      body: "Bocusto is not a factory. It is a sanctuary where physics meets poetry, and raw timber becomes a timeless voice.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDupL1dbt4NExfuxXRKyevvi5h15rJH4lzDs3-l1rBUXKuFm7WhgYrLSrPDw7cpR2L9Kxg_LkGdI31E2AU0sP5FmLRTM6EhkTbuIEcOZbmwJH1J2l2GlYtH4fqaPKsl41S2xACYEWELkx0uFaeNLcCubSJwUaukode9TX8uDdL5UECs_xo8WlJiHhb38rRMpXi9ZZpzTGihQM-3Jj9UPmiBfEVTmq92sHr8taPwqNZZMhdus7Bjn3Sldz9DchJbqoddPlfYc23ldwE",
      alt: "Luxury acoustic guitar with deep amber varnish and intricate grain under studio spotlighting"
    },
    legacy: {
      eyebrow: "The Legacy",
      title: "A forty-year journey through the grain.",
      body1:
        "Founded in a small cellar in Cremona, Bocusto Guitars began with a single mission: to apply the rigorous acoustic principles of violin making to the modern guitar.",
      body2:
        "Every curve, every brace, and every ounce of varnish is the result of four decades of iterative refinement. We don't just build instruments; we curate a lineage of sound that will outlast its player.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1fBwOb_Dqv17qxNvLawA3KiifJ0XCWqGQ4ljFCJk51RpZr-WUvFG8U4U-_7DX3bTH9qCDDvaXROq0QE9EcQl2xTKq9Kq8Se9on5BmqQ7Rmyyt3nOdMR9ltQR1DqU6VxU2n1ayboPdnR2YHr3U_taCch9CRFVQobotYdPGBubVACDozYS6QxWZ3TWN0NnhdxalO1r_YUI4-SJ_EILj0xb3YmpB0GcKeY8CIEyi0D5Aa3fIOqdI3vufVo_SepETfip5R1tJFB1B-e0",
      alt: "Vintage photo of a master luthier examining a guitar body in a sunlit workshop"
    },
    workshop: {
      title: "The Workshop",
      caption: "Hand-crafted in limited series",
      benchEyebrow: "Phase I",
      benchTitle: "The Architecture of Silence",
      benchImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAU6VBQyAG7UBRjrlxppOG4HTEmD0iGzYiT4E5-HmvSzFt9KJpLQHeJ7A0cO33ZfhguKB6aa2GrhGrbAnAGwhM7KwB3Q7538ifnEV71fSFXNPzgeofG5ET_7SHatvwSqO-Fmtt9GDQXNcaI2zaObN87-MC68HZKI63Vt-COGgUdLBs9F9wdPAJOeWv2rwjWh0SKHaJc_fx7e9wxL7c8-vZvhDbhqk2IQr2tFdw6QnZ0n-er1LE4uQofWRJloN_JwgyE4Ntcoaiq7j8",
      benchAlt: "A luthier's workbench covered in wood shavings, precision chisels, and hand planes",
      bracingTitle: "Precision Bracing",
      bracingImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDaNCkMBlM5bNa16v9xTvBAAEuV75SWEA3X3iQV7dmEJ022ejWZLAMRauCAWCWdah9LRd9c8b9zn4VBcD_DJkOBqfEb_b7u2hlDLY-4RFokJ1GFrHattiEGu2rmGSIQlS33D4meFnLplnOtFv4OCJwkbyFVdOCaHMtli2y3cTHgpYP0155sAb-_H-EkPWuVMQ0PYmE6ufVimh8xNwm0vYhKLQM0CUcMKrJmiyfJDH9x1z6B6CwLYER7Y9-Y3QV6dJzail-7ZiQPEks",
      bracingAlt: "Macro detail of internal braces being glued to a guitar soundboard",
      finishTitle: "The Finish",
      finishSideLabel: "Resistance & Refinement",
      finishImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDkg0r4RRkakbkr1JOSRRbf3npmyhFkC9CSXsk7ucAlyN7n0qF0jAA2A3tOaQ5hxJXAwlg1atocze98PcoY-eqn2nfZqRdRYuTkSsvNo-Cxb08GcZ4cKr1lP5gR7cTcrjv-qfdew5laWelPOO6L762TJbfooSjSFQyV9FUsdKpXMmFFSpTf3HwjlxrMwi9GEoYZKUZU8-Oqoq1wXdJVqPfgfW5Bs_qSvRVwsOD7v_kd03v8_VhsXdtyxbnPM57VlqPgIjObk3sn6Ro",
      finishAlt: "Thin layers of French polish being applied to a mahogany guitar back",
      toolsTitle: "The Toolset",
      toolsImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBWNL7woKZjuFbpmHtR_pvi0rgrjI44KcoF-LPmkYYZbW2C1m7A4aqNeBEHOzsGqr-MG9Y_ILoJAmqsG2JLT6Qg76g0IZvWDqOG0um0wJZI5K8j9rc5VAh459U_9PC3pqW9BPtxUk9MiOcbEiZqfz_WjV0hsBS3LBQBBDLzFh3tnodvcCfnBi8vEtcc0D5FBhZe3d4ITdx26wyo-Cf3JT07XO54UAGMS31vaoQgVjSXbdHvKtMlyD_HGCc45rpgRCOj7WQxdCg2ieY",
      toolsAlt: "Rows of specialized luthier tools hanging on a dark wood wall"
    },
    materials: {
      eyebrow: "Material Selection",
      titleLine1: "Ancient Woods,",
      titleLine2: "Modern Voices.",
      quote: '"The wood tells us what the guitar wants to be. We are merely the translators."',
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAChD_RQ7b-NHiCrCDKFmYvekFgxMBI0njjt6WnjsycvxJ_nXIFRTvrjPS4vkhP1hm1Hj0k91yUhLs_V8u1daQao-Sd27FiKpQVDMeNNkHX3m0Fv6iOWbVNy34fSfHbaNaYp5BiuewoLslaCgrpN8XIWpopYZuGDPiIcWx0XAlB2gVgEitZwsDOukrHFIV9aQkyoCrDPQU0_JsFz1DpDv3_0_clYZsk6OzeOETJVc_MpvbRcepi_z_18c7CJAd7J7C5k_ZTljoqDL0",
      alt: "Exotic wood slabs with high-contrast grain leaning against a wall in a timber library",
      list: [
        {
          name: "Alpine Spruce",
          detail:
            "Harvested during winter dormancy at high altitudes, providing a stiffness-to-weight ratio that yields crystalline highs."
        },
        {
          name: "Brazilian Rosewood",
          detail:
            'Sourced from pre-CITES heritage stocks, offering the "glassy" resonance and deep bass response sought by virtuosos.'
        },
        {
          name: "Aged Mahogany",
          detail: "Air-dried for twenty years to ensure absolute stability and a warm, fundamental-focused mid-range."
        }
      ]
    },
    founder: {
      eyebrow: "A Note from the Founder",
      quote1:
        '"In a world of mass production and digital perfection, the guitar remains one of the few physical objects capable of carrying a soul. When you hold a Bocusto, you aren\'t holding a tool. You are holding the culmination of a thousand small, intentional decisions."',
      quote2: '"We build for those who listen as much as they play."',
      name: "Julian Bocusto",
      role: "Master Luthier & Founder"
    }
  },

  contact: {
    hero: {
      title: "The Resonance of Craft",
      body: "Every Bocusto is a conversation between luthier and musician. We invite you to begin yours.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAF1VIXi0meTgyWf9HJtPVqq9457McrjQaZQb6Zzvj0wQq5GQVR5jd7daaGFFs86KhG6vjUsqvqpEpIac4iWxgU_MZkNGf-FfxXi3sMYbwvEGwwOqDqBBId_E_lqZZ-LRLTpRm3oOD91Qs65SoGuQRICdfo8W47pkcuLf29s4oE8pDdkaRsVsqKpIO4Q4hEEftqn0dx7h2F3L4ZJw2Wjccxa6coe2UcWG0kMxuBPucpThKCf00PVbNcqM4taS9xF2rq5LSd8tZcIhc",
      alt: "A Bocusto acoustic guitar lit from the side, showing its amber finish and grain"
    },
    form: {
      eyebrow: "Inquiries",
      title: "Get in Touch",
      body: "Whether you are commissioning a custom build or inquiring about our workshop, our concierge team is at your disposal.",
      nameLabel: "Name",
      namePlaceholder: "YOUR FULL NAME",
      emailLabel: "Email",
      emailPlaceholder: "EMAIL ADDRESS",
      subjectLabel: "Subject",
      messageLabel: "Message",
      messagePlaceholder: "HOW CAN WE ASSIST YOU?",
      submit: "Send Inquiry",
      subjects: [
        { label: "Custom Commission" },
        { label: "Workshop Tour" },
        { label: "Repair & Restoration" },
        { label: "Press Inquiry" }
      ]
    },
    details: {
      studioLabel: "The Studio",
      addressLine1: "128 Resonance Way",
      addressLine2: "Suite 400",
      addressLine3: "Portland, OR 97201",
      conciergeLabel: "Concierge",
      email: "concierge@bocusto.com",
      phone: "+1 (503) 555-0192"
    }
  }
};

export type ContentTree = typeof defaultContent;
export type PageKey = keyof ContentTree;
