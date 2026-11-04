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
  <header
    class="border-b border-b-white bg-red-500 text-white md:flex md:flex-row md:justify-between"
  >
    <h1 class="contents">
      <RouterLink
        to="/"
        class="block border-b border-b-white p-5 font-medium uppercase md:flex-none md:border-none"
      >
        <i18n-t keypath="menu.title" />
      </RouterLink>
    </h1>
    <nav
      class="divide-y divide-dashed md:flex md:grow md:flex-row md:justify-end md:divide-none"
      aria-label="Menu"
    >
      <RouterLink
        to="/"
        class="block p-5 hover:bg-red-600 aria-[current=page]:font-bold aria-[current=page]:underline"
      >
        <i18n-t keypath="menu.home" />
      </RouterLink>
      <RouterLink
        to="/configure"
        class="block p-5 hover:bg-red-600 aria-[current=page]:font-bold aria-[current=page]:underline"
      >
        <i18n-t keypath="menu.configure" />
      </RouterLink>
      <RouterLink
        to="/how"
        class="block p-5 hover:bg-red-600 aria-[current=page]:font-bold aria-[current=page]:underline"
      >
        <i18n-t keypath="menu.how" />
      </RouterLink>
      <RouterLink
        to="/about"
        class="block p-5 hover:bg-red-600 aria-[current=page]:font-bold aria-[current=page]:underline"
      >
        <i18n-t keypath="menu.about" />
      </RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
