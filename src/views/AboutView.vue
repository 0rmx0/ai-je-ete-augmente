<template>
  <main class="mx-auto max-w-screen-lg p-5">
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.why.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.why.p1" />
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.why.p2" />
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.goal.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.goal.p1" />
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.goal.p2" />
    </p>
    <ul v-if="$i18n.locale === 'en'" class="mb-3 p-3">
      <li>
        <a href="https://ec.europa.eu/eurostat/web/main/home" target="_blank" class="underline">
          <i18n-t keypath="about.goal.p3.1" />
        </a>
      </li>
      <li>
        <a
          href="https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm"
          target="_blank"
          class="underline"
        >
          <i18n-t keypath="about.goal.p3.2" />
        </a>
      </li>
      <li>
        <a
          href="https://www.economie.gouv.fr/cedef/evolution-prix-consommation"
          target="_blank"
          class="underline"
        >
          <i18n-t keypath="about.goal.p3.3" />
        </a>
      </li>
    </ul>
    <ul v-else-if="$i18n.locale === 'fr'" class="mb-3 p-3">
      <li>
        <a
          href="https://www.economie.gouv.fr/cedef/evolution-prix-consommation"
          target="_blank"
          class="underline"
        >
          <i18n-t keypath="about.goal.p3.1" />
        </a>
      </li>
      <li>
        <a href="https://www.insee.fr/fr/statistiques/4268033" target="_blank" class="underline">
          <i18n-t keypath="about.goal.p3.2" />
        </a>
      </li>
      <li>
        <a href="https://ec.europa.eu/eurostat/web/main/home" target="_blank" class="underline">
          <i18n-t keypath="about.goal.p3.3" />
        </a>
      </li>
      <li>
        <a
          href="https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm"
          target="_blank"
          class="underline"
        >
          <i18n-t keypath="about.goal.p3.4" />
        </a>
      </li>
      <li>
        <a href="https://france-inflation.com" target="_blank" class="underline">
          <i18n-t keypath="about.goal.p3.5" />
        </a>
      </li>
    </ul>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.contribute.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.contribute.p1.p">
        <template v-slot:link>
          <a href="https://github.com/0rmx0/ai-je-ete-augmente" target="_blank" class="underline">
            <i18n-t keypath="about.contribute.p1.link" />
          </a>
        </template>
      </i18n-t>
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.discuss.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.discuss.p1.p">
        <template v-slot:linkMastodon>
          <a href="https://social.vivaldi.net/@larsvanciental" target="_blank" class="underline">
            <i18n-t keypath="about.discuss.p1.linkMastodon" />
          </a>
        </template>
        <template v-slot:linkSource>
          <a
            href="https://github.com/0rmx0/ai-je-ete-augmente/issues"
            target="_blank"
            class="underline"
          >
            <i18n-t keypath="about.discuss.p1.linkSource" />
          </a>
        </template>
      </i18n-t>
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.hosting.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.hosting.p1" />
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.hosting.p2.p">
        <template v-slot:link>
          <a href="https://github.com/site-terms" target="_blank" class="underline">
            <i18n-t keypath="about.hosting.p2.link" />
          </a>
        </template>
      </i18n-t>
    </p>
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="about.legal.title" />
    </h2>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.legal.p1" />
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.legal.p2.p">
        <template v-slot:link>
          <a href="https://github.com/site-terms" target="_blank" class="underline">
            <i18n-t keypath="about.legal.p2.link" />
          </a>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.legal.p3.p">
        <template v-slot:link>
          <a href="https://github.com/0rmx0/ai-je-ete-augmente" target="_blank" class="underline">
            <i18n-t keypath="about.legal.p3.link" />
          </a>
        </template>
      </i18n-t>
    </p>
    <p class="mb-3 p-3">
      <i18n-t keypath="about.legal.p4" />
    </p>
  </main>
</template>
