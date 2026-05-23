<template>
  <div class="min-h-screen bg-white text-gray-900 antialiased">
    <!-- ─────────── Top bar ─────────── -->
    <header class="border-b border-gray-200">
      <div class="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-gray-900">
            <span class="text-[10px] font-bold leading-none text-white">CM</span>
          </div>
          <span class="text-[13px] font-semibold tracking-tight text-gray-900">CheckinMe</span>
        </div>

        <nav class="flex items-center gap-1">
          <a
            v-for="link in topLinks"
            :key="link.href"
            :href="link.href"
            class="hidden rounded px-2.5 py-1 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:inline-block"
          >
            {{ link.label }}
          </a>
          <span class="mx-2 hidden h-3 w-px bg-gray-200 sm:inline-block" />
          <router-link
            :to="ctaPath"
            class="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-gray-700"
          >
            {{ ctaShort }}
            <ArrowRightIcon class="h-3 w-3" />
          </router-link>
        </nav>
      </div>
    </header>

    <!-- ─────────── Hero ─────────── -->
    <section class="border-b border-gray-200">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-12 gap-x-10 gap-y-10 py-16 lg:py-24">
          <!-- Left: editorial -->
          <div class="col-span-12 lg:col-span-5">
            <div class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
              For sales, trainers, and the work in between
            </div>

            <h1 class="mt-6 text-[44px] font-semibold leading-[1.05] tracking-tight text-gray-950 sm:text-[52px]">
              Plan the visit.<br />
              Send the trainer.<br />
              Know it got done.
            </h1>

            <p class="mt-6 max-w-md text-[15px] leading-relaxed text-gray-600">
              CheckinMe gives your team a shared view of every customer onboarding — from the
              first booking to the final sign-off. Sales schedules, trainers check in, and
              everyone sees the same progress in real time.
            </p>

            <div class="mt-8 flex items-center gap-5">
              <router-link
                :to="ctaPath"
                class="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-700"
              >
                {{ ctaPrimary }}
                <ArrowRightIcon class="h-3.5 w-3.5" />
              </router-link>
              <a href="#workflow" class="text-[13px] font-medium text-gray-700 underline-offset-4 hover:underline">
                See how it works
              </a>
            </div>

            <p class="mt-10 text-[12px] text-gray-400">
              Internal access — ask your administrator for an account.
            </p>
          </div>

          <!-- Right: today's schedule card -->
          <div class="col-span-12 lg:col-span-7">
            <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/40">
              <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
                <div class="flex items-center gap-2 text-[12px] font-medium text-gray-700">
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Today &middot; Tuesday, 19 May
                </div>
                <div class="text-[11px] text-gray-500">
                  12 appointments &middot; 3 trainers in the field
                </div>
              </div>

              <div class="divide-y divide-gray-200">
                <article
                  v-for="appt in heroAppointments"
                  :key="appt.customer"
                  class="grid grid-cols-12 gap-4 px-4 py-4 transition-colors hover:bg-white"
                >
                  <div class="col-span-2 flex items-start">
                    <div class="mt-1 flex items-center gap-0.5">
                      <span
                        v-for="(filled, i) in appt.flow"
                        :key="i"
                        class="h-1.5 w-3 rounded-sm"
                        :class="filled ? appt.dotColor : 'bg-gray-200'"
                      />
                    </div>
                  </div>

                  <div class="col-span-10 grid grid-cols-12 gap-4">
                    <div class="col-span-12 sm:col-span-7">
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] font-medium text-gray-400">{{ appt.time }}</span>
                        <span
                          class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                          :class="appt.statusBadge"
                        >
                          {{ appt.status }}
                        </span>
                      </div>
                      <p class="mt-1.5 text-[14px] font-semibold leading-tight text-gray-900">
                        {{ appt.customer }}
                      </p>
                      <p class="mt-0.5 text-[12px] text-gray-500">
                        Trainer &middot; <span class="text-gray-700">{{ appt.trainer }}</span>
                      </p>
                    </div>

                    <div class="col-span-12 grid grid-cols-2 gap-3 sm:col-span-5">
                      <div>
                        <p class="text-[10px] uppercase tracking-wider text-gray-400">Location</p>
                        <p class="mt-0.5 text-[12px] text-gray-700">{{ appt.location }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] uppercase tracking-wider text-gray-400">Photos</p>
                        <p class="mt-0.5 text-[12px] text-gray-700">{{ appt.photos }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 text-[11px] text-gray-500">
                <span>+ 9 more today</span>
                <span class="font-medium text-gray-700">View in calendar →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Ops stats bar ─────────── -->
    <section class="border-b border-gray-200 bg-gray-50/60">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-2 divide-gray-200 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
          <div
            v-for="(stat, i) in opsStats"
            :key="stat.label"
            class="px-4 py-5"
            :class="i > 0 ? 'border-t border-gray-200 lg:border-t-0' : ''"
          >
            <p class="text-[11px] font-medium text-gray-500">
              {{ stat.label }}
            </p>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-[22px] font-semibold tabular-nums text-gray-950">
                {{ stat.value }}
              </span>
              <span class="text-[11px] tabular-nums" :class="stat.deltaColor">
                {{ stat.delta }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Feature row 1: Status ─────────── -->
    <section id="workflow" class="border-b border-gray-200">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-12 gap-x-10 gap-y-10 py-20">
          <div class="col-span-12 lg:col-span-5">
            <p class="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Step 1 &middot; Status</p>
            <h2 class="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-gray-950">
              Every appointment, the same story.
            </h2>
            <p class="mt-5 max-w-md text-[14px] leading-relaxed text-gray-600">
              Each visit moves through a clear set of steps — from scheduled to completed.
              Sales sees the same status that the trainer sees. No status meetings, no
              phone-tag, no &ldquo;is it done yet?&rdquo;
            </p>

            <dl class="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              <div
                v-for="row in statusRows"
                :key="row.label"
                class="grid grid-cols-12 gap-4 py-3"
              >
                <dt class="col-span-5 flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :class="row.dot" />
                  <span class="text-[13px] font-medium text-gray-900">{{ row.label }}</span>
                </dt>
                <dd class="col-span-7 text-[13px] text-gray-600">{{ row.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="col-span-12 lg:col-span-7">
            <div class="overflow-hidden rounded-lg border border-gray-200">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <p class="text-[12px] font-medium text-gray-700">
                  Acme Robotics &middot; today's session
                </p>
              </div>
              <div class="bg-white">
                <ol class="divide-y divide-gray-100">
                  <li
                    v-for="(step, i) in timelineSteps"
                    :key="step.status"
                    class="flex items-start gap-4 px-5 py-4"
                  >
                    <div class="flex flex-col items-center">
                      <span
                        class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                        :class="step.dotClass"
                      >
                        {{ i + 1 }}
                      </span>
                      <span
                        v-if="i < timelineSteps.length - 1"
                        class="mt-1 h-6 w-px bg-gray-200"
                      />
                    </div>
                    <div class="flex flex-1 items-baseline justify-between gap-4">
                      <div>
                        <p class="text-[13px] font-semibold" :class="step.textClass">
                          {{ step.status }}
                        </p>
                        <p class="mt-0.5 text-[12px] text-gray-500">{{ step.note }}</p>
                      </div>
                      <span class="text-[11px] tabular-nums text-gray-400">{{ step.ts }}</span>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Feature row 2: Proof ─────────── -->
    <section class="border-b border-gray-200 bg-gray-50/40">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-12 gap-x-10 gap-y-10 py-20">
          <div class="col-span-12 order-2 lg:order-1 lg:col-span-7">
            <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <p class="text-[12px] font-medium text-gray-700">
                  How proof gets attached to a visit
                </p>
              </div>

              <div class="grid grid-cols-3 divide-x divide-gray-100 bg-white">
                <div
                  v-for="phase in uploadPhases"
                  :key="phase.label"
                  class="p-5"
                >
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                    :class="phase.dotClass"
                  >
                    {{ phase.step }}
                  </span>
                  <p class="mt-4 text-[14px] font-semibold text-gray-900">{{ phase.label }}</p>
                  <p class="mt-1.5 text-[12px] leading-relaxed text-gray-500">{{ phase.body }}</p>
                </div>
              </div>

              <div class="border-t border-gray-200 bg-gray-50/60 px-4 py-3">
                <p class="text-[12px] text-gray-600">
                  Every photo lives with the appointment it belongs to —
                  <span class="font-medium text-gray-900">no detached attachments, no lost files.</span>
                </p>
              </div>
            </div>
          </div>

          <div class="col-span-12 order-1 lg:order-2 lg:col-span-5">
            <p class="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Step 2 &middot; Proof</p>
            <h2 class="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-gray-950">
              Show, don't tell.
            </h2>
            <p class="mt-5 max-w-md text-[14px] leading-relaxed text-gray-600">
              Trainers take photos on the spot — when they arrive, when they wrap up — and the
              system stamps each one with the time and place. When you read &ldquo;done&rdquo;,
              you can see what done looked like.
            </p>
            <ul class="mt-8 space-y-3 text-[13px] text-gray-700">
              <li class="flex items-start gap-3">
                <span class="mt-1.5 h-1 w-1 flex-none rounded-full bg-gray-900" />
                <span>Photos save straight to secure storage — fast, even on a phone.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1.5 h-1 w-1 flex-none rounded-full bg-gray-900" />
                <span>Each photo is locked to the visit it came from — nothing floats around.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1.5 h-1 w-1 flex-none rounded-full bg-gray-900" />
                <span>Drop a business patent in and the system fills out the company details for you.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Feature row 3: Onboarding pipeline ─────────── -->
    <section class="border-b border-gray-200">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-12 gap-x-10 gap-y-10 py-20">
          <div class="col-span-12 lg:col-span-5">
            <p class="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Step 3 &middot; Onboarding</p>
            <h2 class="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-gray-950">
              The bar moves on its own.
            </h2>
            <p class="mt-5 max-w-md text-[14px] leading-relaxed text-gray-600">
              Company details, policy reviews, training lessons — as each piece gets done, the
              progress bar updates itself. Sales sees the same percentage the trainer sees, no
              refreshes needed.
            </p>
          </div>

          <div class="col-span-12 lg:col-span-7">
            <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-2.5 flex items-center justify-between">
                <p class="text-[12px] font-medium text-gray-700">
                  Acme Robotics &middot; onboarding
                </p>
                <p class="text-[12px] font-semibold tabular-nums text-gray-900">68% complete</p>
              </div>

              <ul class="divide-y divide-gray-100">
                <li
                  v-for="piece in onboardingPieces"
                  :key="piece.label"
                  class="grid grid-cols-12 gap-4 px-4 py-3.5"
                >
                  <div class="col-span-4 flex items-center gap-2.5">
                    <component :is="piece.icon" class="h-4 w-4 text-gray-400" />
                    <span class="text-[13px] font-medium text-gray-900">{{ piece.label }}</span>
                  </div>
                  <div class="col-span-5 flex items-center">
                    <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        class="h-full rounded-full"
                        :class="piece.barClass"
                        :style="{ width: piece.pct + '%' }"
                      />
                    </div>
                  </div>
                  <div class="col-span-3 flex items-center justify-end gap-2">
                    <span class="text-[11px] tabular-nums text-gray-700">{{ piece.pct }}%</span>
                    <span
                      class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                      :class="piece.tagClass"
                    >
                      {{ piece.tag }}
                    </span>
                  </div>
                </li>
              </ul>

              <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
                Updated just now
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Roles ─────────── -->
    <section class="border-b border-gray-200 bg-gray-50/40">
      <div class="mx-auto max-w-[1200px] px-6 py-20">
        <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p class="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Step 4 &middot; Teams</p>
            <h2 class="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-gray-950">
              Three roles, one source of truth.
            </h2>
          </div>
          <p class="max-w-sm text-[13px] text-gray-600">
            Everyone sees what they need to. Sales runs the schedule, trainers run the visits,
            admins keep an eye on everything.
          </p>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 md:grid-cols-3">
          <div
            v-for="role in roles"
            :key="role.name"
            class="bg-white p-6"
          >
            <div class="flex items-center justify-between">
              <span class="text-[14px] font-semibold" :class="role.accent">
                {{ role.name }}
              </span>
              <component :is="role.icon" class="h-4 w-4 text-gray-300" />
            </div>
            <p class="mt-4 text-[14px] leading-relaxed text-gray-700">{{ role.body }}</p>
            <ul class="mt-6 space-y-2 text-[12px]">
              <li
                v-for="cap in role.capabilities"
                :key="cap"
                class="flex items-start gap-2"
              >
                <span class="mt-1.5 h-1 w-1 flex-none rounded-full bg-gray-400" />
                <span class="text-gray-600">{{ cap }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Capability strip ─────────── -->
    <section class="border-b border-gray-200">
      <div class="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-[12px] text-gray-500">
        <span>Tracked appointments</span>
        <span class="text-gray-300">·</span>
        <span>Location verification</span>
        <span class="text-gray-300">·</span>
        <span>Secure photo upload</span>
        <span class="text-gray-300">·</span>
        <span>Onboarding progress</span>
        <span class="text-gray-300">·</span>
        <span>Lesson dispatch</span>
        <span class="text-gray-300">·</span>
        <span>Audit history</span>
        <span class="text-gray-300">·</span>
        <span>Role-based access</span>
      </div>
    </section>

    <!-- ─────────── Final CTA ─────────── -->
    <section class="border-b border-gray-200">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid grid-cols-12 gap-x-10 gap-y-6 py-20">
          <div class="col-span-12 lg:col-span-7">
            <h2 class="text-[32px] font-semibold leading-tight tracking-tight text-gray-950">
              Pick up where you left off.
            </h2>
            <p class="mt-3 max-w-md text-[14px] text-gray-600">
              Sign in to open your dashboard, calendar, and onboarding pipeline.
            </p>
          </div>
          <div class="col-span-12 flex items-end lg:col-span-5 lg:justify-end">
            <router-link
              :to="ctaPath"
              class="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-700"
            >
              {{ ctaFinal }}
              <ArrowRightIcon class="h-3.5 w-3.5" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Footer ─────────── -->
    <footer>
      <div class="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 px-6 py-8 sm:flex-row sm:items-center">
        <div class="flex items-center gap-3">
          <div class="flex h-5 w-5 items-center justify-center rounded bg-gray-900">
            <span class="text-[9px] font-bold text-white">CM</span>
          </div>
          <span class="text-[12px] text-gray-600">CheckinMe</span>
          <span class="text-[11px] text-gray-400">
            Customer onboarding, made shared.
          </span>
        </div>
        <p class="text-[11px] text-gray-400">
          &copy; {{ currentYear }} CheckinMe. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  FilmIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const currentYear = computed(() => new Date().getFullYear())

const dashboardPath = computed(() => {
  const role = authStore.user?.role
  if (role === 'trainer') return '/trainer'
  if (role === 'admin') return '/admin/users'
  return '/sales'
})

const ctaPath = computed(() => (authStore.isAuthenticated ? dashboardPath.value : '/login'))
const ctaPrimary = computed(() => (authStore.isAuthenticated ? 'Open dashboard' : 'Sign in'))
const ctaShort = computed(() => (authStore.isAuthenticated ? 'Dashboard' : 'Sign in'))
const ctaFinal = computed(() => (authStore.isAuthenticated ? 'Open my dashboard' : 'Sign in to CheckinMe'))

const topLinks = [
  { label: 'How it works', href: '#workflow' },
]

const heroAppointments = [
  {
    customer: 'Acme Robotics',
    trainer: 'Sok L.',
    time: '09:00',
    status: 'On-site',
    flow: [true, true, true, false],
    dotColor: 'bg-green-500',
    statusBadge: 'bg-green-50 text-green-700',
    location: 'Confirmed',
    photos: '2 of 2 added',
  },
  {
    customer: 'Mekong Bank',
    trainer: 'Dara P.',
    time: '11:30',
    status: 'En route',
    flow: [true, true, false, false],
    dotColor: 'bg-amber-500',
    statusBadge: 'bg-amber-50 text-amber-700',
    location: 'On the way',
    photos: 'Not yet',
  },
  {
    customer: 'Phnom Penh Tech',
    trainer: 'Channa S.',
    time: '14:00',
    status: 'Scheduled',
    flow: [true, false, false, false],
    dotColor: 'bg-blue-500',
    statusBadge: 'bg-blue-50 text-blue-700',
    location: '—',
    photos: 'Not yet',
  },
]

const opsStats = [
  { label: 'Active onboardings', value: '47', delta: '+3 this week', deltaColor: 'text-green-600' },
  { label: 'Check-ins today', value: '12', delta: '+5 vs avg', deltaColor: 'text-green-600' },
  { label: 'Live sessions', value: '4', delta: 'right now', deltaColor: 'text-gray-500' },
  { label: 'Trainers in field', value: '3', delta: 'right now', deltaColor: 'text-gray-500' },
  { label: 'Photos this week', value: '38', delta: '+11', deltaColor: 'text-green-600' },
  { label: 'Avg. completion', value: '2.4 days', delta: '−0.3', deltaColor: 'text-green-600' },
]

const statusRows = [
  { label: 'Scheduled', value: 'Booked. Waiting for the trainer to head out.', dot: 'bg-blue-500' },
  { label: 'En route', value: 'Trainer is on the way to the site.', dot: 'bg-amber-500' },
  { label: 'On-site', value: 'Trainer has arrived and started the session.', dot: 'bg-green-500' },
  { label: 'Completed', value: 'Session wrapped, photos and notes saved.', dot: 'bg-purple-500' },
  { label: 'Cancelled', value: 'Not happening — with a reason on file.', dot: 'bg-red-400' },
  { label: 'Rescheduled', value: 'Moved to a new slot. The old one is kept.', dot: 'bg-gray-400' },
]

const timelineSteps = [
  {
    status: 'Scheduled',
    note: 'Booked by Lina (Sales) for Acme Robotics',
    ts: '08:14',
    dotClass: 'bg-blue-50 text-blue-700',
    textClass: 'text-blue-700',
  },
  {
    status: 'En route',
    note: 'Trainer left the office',
    ts: '08:42',
    dotClass: 'bg-amber-50 text-amber-700',
    textClass: 'text-amber-700',
  },
  {
    status: 'On-site',
    note: 'Trainer arrived · arrival photo added',
    ts: '09:03',
    dotClass: 'bg-green-50 text-green-700',
    textClass: 'text-green-700',
  },
  {
    status: 'Completed',
    note: 'Waiting on wrap-up photo and student count',
    ts: '—',
    dotClass: 'bg-gray-100 text-gray-400',
    textClass: 'text-gray-400',
  },
]

const uploadPhases = [
  {
    step: '1',
    label: 'Trainer takes the photo',
    body: 'Right on the spot — on arrival and on completion.',
    dotClass: 'bg-blue-50 text-blue-700',
  },
  {
    step: '2',
    label: 'Stamped and saved',
    body: 'Tagged with the time and place, then sent to secure storage.',
    dotClass: 'bg-amber-50 text-amber-700',
  },
  {
    step: '3',
    label: 'Tied to the visit',
    body: 'The photo becomes part of that appointment\'s record — for good.',
    dotClass: 'bg-green-50 text-green-700',
  },
]

const onboardingPieces = [
  {
    label: 'Company details',
    icon: BuildingOffice2Icon,
    pct: 100,
    barClass: 'bg-green-500',
    tag: 'Complete',
    tagClass: 'bg-green-50 text-green-700',
  },
  {
    label: 'System review',
    icon: CpuChipIcon,
    pct: 75,
    barClass: 'bg-blue-500',
    tag: 'In progress',
    tagClass: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'Policy checklist',
    icon: ClipboardDocumentCheckIcon,
    pct: 80,
    barClass: 'bg-blue-500',
    tag: 'In progress',
    tagClass: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'Training lessons',
    icon: FilmIcon,
    pct: 33,
    barClass: 'bg-gray-400',
    tag: 'Up next',
    tagClass: 'bg-gray-100 text-gray-600',
  },
]

const roles = [
  {
    name: 'Sales',
    icon: ClipboardDocumentListIcon,
    accent: 'text-blue-700',
    body: 'Owns the customer relationship. Books visits, manages the onboarding plan, and reads progress from the field.',
    capabilities: [
      'Schedule and assign appointments',
      'Manage customer company info',
      'Configure business types and bot replies',
      'Watch progress as it happens',
    ],
  },
  {
    name: 'Trainer',
    icon: UserIcon,
    accent: 'text-green-700',
    body: 'Delivers the work on-site. Sees only what is assigned. Captures proof at every step of the visit.',
    capabilities: [
      'Check in and check out from the site',
      'Capture arrival and wrap-up photos',
      'Mark policies and send lessons',
      'Use the mobile-friendly daily view',
    ],
  },
  {
    name: 'Admin',
    icon: ShieldCheckIcon,
    accent: 'text-purple-700',
    body: 'Full oversight. Manages people, watches the audit trail, and steps in when something needs attention.',
    capabilities: [
      'Manage users across all roles',
      'Review the full activity history',
      'Open any sales or trainer view',
      'Suspend, restore, and clean up accounts',
    ],
  },
]
</script>
