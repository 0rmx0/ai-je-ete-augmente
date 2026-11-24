<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration, loadConfigurationFromStorage } from '@/components/SharedConfiguration'

export default {
  components: { RouterLink, RouterView },
  data() {
    return {
      configuration: SharedConfiguration as Configuration
    }
  },
  created() {
    loadConfigurationFromStorage()
    this.$i18n.locale = this.configuration.locale
  },
  watch: {
    configuration: {
      handler(configuration: Configuration): void {
        localStorage.setItem('configuration', JSON.stringify(configuration))
      },
      deep: true
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white dark:bg-brand-500"
          >
            <i18n-t keypath="menu.logoSymbol" />
          </span>
          <span class="text-lg font-bold tracking-tight text-ink-primary dark:text-zinc-50">
            <i18n-t keypath="menu.title" />
          </span>
        </RouterLink>
        <nav class="flex items-center gap-1" aria-label="Menu">
          <RouterLink to="/" class="nav-link">
            <i18n-t keypath="menu.home" />
          </RouterLink>
          <RouterLink to="/configure" class="nav-link">
            <i18n-t keypath="menu.configure" />
          </RouterLink>
          <RouterLink to="/how" class="nav-link">
            <i18n-t keypath="menu.how" />
          </RouterLink>
          <RouterLink to="/about" class="nav-link">
            <i18n-t keypath="menu.about" />
          </RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>
