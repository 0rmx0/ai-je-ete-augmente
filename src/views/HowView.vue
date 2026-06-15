<template>
  <main class="mx-auto max-w-screen-lg p-5">
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="how.usage.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.usage.p1.p">
        <template v-slot:link>
          <RouterLink to="/" class="underline">
            <i18n-t keypath="how.usage.p1.link" />
          </RouterLink>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.usage.p2" />
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.usage.p3.p">
        <template v-slot:link>
          <RouterLink to="/configure" class="underline">
            <i18n-t keypath="how.usage.p3.link" />
          </RouterLink>
        </template>
      </i18n-t>
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="how.operating.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.operating.p1">
        <template v-slot:stuff>
          <i>
            <i18n-t keypath="how.operating.stuff" />
          </i>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.operating.p2">
        <template v-slot:stuff>
          <i>
            <i18n-t keypath="how.operating.stuff" />
          </i>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.operating.p3">
        <template v-slot:stuff>
          <i>
            <i18n-t keypath="how.operating.stuff" />
          </i>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.operating.p4">
        <template v-slot:stuff>
          <i>
            <i18n-t keypath="how.operating.stuff" />
          </i>
        </template>
      </i18n-t>
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="how.inflation.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="how.inflation.p1.p">
        <template v-slot:link>
          <a
            href="https://ec.europa.eu/eurostat/data/database?node_code=prc_hicp_minr"
            target="_blank"
            class="underline"
          >
            <i18n-t keypath="how.inflation.p1.link" />
          </a>
        </template>
      </i18n-t>
    </p>
  </main>
</template>
