// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'WelJunyu\'s blog',
    tagline: '',
    url: 'https://blog.WelJunyu.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'WelJunyu', // Usually your GitHub org/user name.
    projectName: 'WelJunyu\'s blog', // Usually your repo name.

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    routeBasePath: '/',
                    editUrl: 'https://github.com/WelJunyu/blog/tree/main',
                    remarkPlugins: [math],
                    rehypePlugins: [katex],
                },
                blog: {
                    showReadingTime: true,
                    routeBasePath: '/',
                    editUrl: 'https://github.com/WelJunyu/blog/tree/main',
                    remarkPlugins: [math],
                    rehypePlugins: [katex],
                    blogSidebarCount: "ALL",
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: 'daily',
                    priority: 0.5,
                    ignorePatterns: [
                        '/tags/**', 
                        '/ndx100', 
                        '/wiki', 
                        '/hdj', 
                        '/fast-dj',
                        '/jcq',
                        '/tail-inequality',
                        '/hash-tech',
                        '/data_stream_models_and_frequent_item_mining',
                        '/pdf/**'
                    ],
                    filename: 'sitemap.xml',
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'WelJunyu\'s',
                items: [
                    {
                        to: '/',
                        label: 'Blog',
                        position: 'left'
                    },
                    {
                        to: '/archive',
                        label: 'Archive',
                        position: 'left'
                    },
                    {
                        to: '/friends',
                        label: 'Friends',
                        position: 'right'
                    },
                    {
                        to: '/about',
                        label: 'About',
                        position: 'right'
                    },
                    {
                        href: 'https://github.com/WelJunyu',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'light',
                copyright: `© ${new Date().getFullYear()} WelJunyu`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
            tableOfContents: {
                minHeadingLevel: 2,
                maxHeadingLevel: 3,
            },
        }),
    stylesheets: [
        {
            href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
            type: 'text/css',
            integrity:
                'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
            crossorigin: 'anonymous',
        },
    ],

    themes: [
        [
            require.resolve("@easyops-cn/docusaurus-search-local"),
            /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
            ({
              // ... Your options.
              // `hashed` is recommended as long-term-cache of index file is possible.
              hashed: true,
              // For Docs using Chinese, The `language` is recommended to set to:
              language: ["en", "zh"],

              blogRouteBasePath: "/",
            }),
        ],
    ],
};

module.exports = config;