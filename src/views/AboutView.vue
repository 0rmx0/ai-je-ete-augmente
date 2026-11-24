<template>
  <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-6 lg:px-8">
    <article class="card space-y-6">
      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.why.title" />
        </h2>
        <div class="mt-3 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <p><i18n-t keypath="about.why.p1" /></p>
          <p><i18n-t keypath="about.why.p2" /></p>
        </div>
      </section>

      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.goal.title" />
        </h2>
        <div class="mt-3 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <p><i18n-t keypath="about.goal.p1" /></p>
          <p><i18n-t keypath="about.goal.p2" /></p>
          <ul v-if="$i18n.locale === 'en'" class="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://ec.europa.eu/eurostat/web/main/home"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.1" />
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.2" />
              </a>
            </li>
            <li>
              <a
                href="https://www.economie.gouv.fr/cedef/evolution-prix-consommation"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.3" />
              </a>
            </li>
          </ul>
          <ul v-else-if="$i18n.locale === 'fr'" class="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://www.economie.gouv.fr/cedef/evolution-prix-consommation"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.1" />
              </a>
            </li>
            <li>
              <a
                href="https://www.insee.fr/fr/statistiques/4268033"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.2" />
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/eurostat/web/main/home"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.3" />
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.4" />
              </a>
            </li>
            <li>
              <a
                href="https://france-inflation.com"
                target="_blank"
                class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.goal.p3.5" />
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.contribute.title" />
        </h2>
        <p class="mt-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <i18n-t keypath="about.contribute.p1.p">
            <template v-slot:link>
              <a
                href="https://github.com/0rmx0/ai-je-ete-augmente"
                target="_blank"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.contribute.p1.link" />
              </a>
            </template>
          </i18n-t>
        </p>
      </section>

      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.discuss.title" />
        </h2>
        <p class="mt-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <i18n-t keypath="about.discuss.p1.p">
            <template v-slot:linkMastodon>
              <a
                href="https://social.vivaldi.net/@larsvanciental"
                target="_blank"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.discuss.p1.linkMastodon" />
              </a>
            </template>
            <template v-slot:linkSource>
              <a
                href="https://github.com/0rmx0/ai-je-ete-augmente/issues"
                target="_blank"
                class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <i18n-t keypath="about.discuss.p1.linkSource" />
              </a>
            </template>
          </i18n-t>
        </p>
      </section>

      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.hosting.title" />
        </h2>
        <div class="mt-3 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <p><i18n-t keypath="about.hosting.p1" /></p>
          <p>
            <i18n-t keypath="about.hosting.p2.p">
              <template v-slot:link>
                <a
                  href="https://github.com/site-terms"
                  target="_blank"
                  class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <i18n-t keypath="about.hosting.p2.link" />
                </a>
              </template>
            </i18n-t>
          </p>
        </div>
      </section>

      <section>
        <h2 class="section-title">
          <i18n-t keypath="about.legal.title" />
        </h2>
        <div class="mt-3 space-y-3 leading-relaxed text-ink-secondary dark:text-zinc-300">
          <p><i18n-t keypath="about.legal.p1" /></p>
          <p>
            <i18n-t keypath="about.legal.p2.p">
              <template v-slot:link>
                <a
                  href="https://github.com/site-terms"
                  target="_blank"
                  class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <i18n-t keypath="about.legal.p2.link" />
                </a>
              </template>
            </i18n-t>
          </p>
          <p>
            <i18n-t keypath="about.legal.p3.p">
              <template v-slot:link>
                <a
                  href="https://github.com/0rmx0/ai-je-ete-augmente"
                  target="_blank"
                  class="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  <i18n-t keypath="about.legal.p3.link" />
                </a>
              </template>
            </i18n-t>
          </p>
          <p><i18n-t keypath="about.legal.p4" /></p>
        </div>
      </section>
    </article>
  </main>
</template>
