<template>
  <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-6 lg:px-8">
    <article class="card prose prose-slate dark:prose-invert max-w-none">
      <h2 class="section-title">
        <i18n-t keypath="how.usage.title" />
      </h2>
      <div class="mt-4 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
        <p>
          <i18n-t keypath="how.usage.p1.p">
            <template v-slot:link>
              <RouterLink
                to="/"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="how.usage.p1.link" />
              </RouterLink>
            </template>
          </i18n-t>
        </p>
        <p>
          <i18n-t keypath="how.usage.p2" />
        </p>
        <p>
          <i18n-t keypath="how.usage.p3.p">
            <template v-slot:link>
              <RouterLink
                to="/configure"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="how.usage.p3.link" />
              </RouterLink>
            </template>
          </i18n-t>
        </p>
      </div>

      <h2 class="section-title mt-8">
        <i18n-t keypath="how.operating.title" />
      </h2>
      <div class="mt-4 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
        <p v-for="n in 4" :key="n">
          <i18n-t :keypath="'how.operating.p' + n">
            <template v-slot:stuff>
              <em class="text-ink-primary dark:text-zinc-50">
                <i18n-t keypath="how.operating.stuff" />
              </em>
            </template>
          </i18n-t>
        </p>
      </div>

      <h2 class="section-title mt-8">
        <i18n-t keypath="how.inflation.title" />
      </h2>
      <div class="mt-4 leading-relaxed text-ink-secondary dark:text-zinc-300">
        <p>
          <i18n-t keypath="how.inflation.p1.p">
            <template v-slot:link>
              <a
                href="https://ec.europa.eu/eurostat/data/database?node_code=prc_hicp_minr"
                target="_blank"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="how.inflation.p1.link" />
              </a>
            </template>
          </i18n-t>
        </p>
      </div>
    </article>
  </main>
</template>
