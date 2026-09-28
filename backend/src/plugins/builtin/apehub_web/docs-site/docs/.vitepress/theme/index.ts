import { h, defineComponent, onMounted, ref } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

const SITE_THEME_KEY = 'ape-theme'
const VITEPRESS_THEME_KEY = 'vitepress-theme-appearance'

const SiteActions = defineComponent({
  name: 'ApehubSiteActions',
  setup() {
    const isEn = ref(false)
    onMounted(() => {
      try {
        // URL wins: pages under /en/ are English regardless of saved preference.
        const pathIsEn = /\/en(\/|$)/.test(window.location.pathname)
        const saved = localStorage.getItem('ape-lang')
          || (/^zh/i.test(navigator.language || '') ? 'zh' : 'en')
        isEn.value = pathIsEn || saved === 'en'
      } catch (e) { /* keep zh */ }

      const root = document.documentElement
      const syncTheme = () => {
        const theme = root.classList.contains('dark') ? 'dark' : 'light'
        localStorage.setItem(SITE_THEME_KEY, theme)
        localStorage.setItem(VITEPRESS_THEME_KEY, theme)
      }

      // VitePress owns the toggle; mirror its html.dark state for the website.
      syncTheme()
      const observer = new MutationObserver(syncTheme)
      observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    })

    return () => h('div', { class: 'apehub-site-actions' }, [
      h('a', { class: 'apehub-site-link', href: '/apehub-web/', target: '_self' }, isEn.value ? 'Website Home' : '官网首页'),
    ])
  },
})

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h(SiteActions),
  }),
}