<template>
  <div class="space-y-5 mt-3">
    <!-- Page header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-lg font-semibold text-gray-900">Onboarding Detail</h1>
        <p class="text-xs text-gray-400 font-mono mt-0.5">{{ ob?.request_code || '—' }}</p>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="3" />

    <template v-else-if="ob">
      <!--  Top action bar: Progress + Refresh + Mark Complete  -->
      <div class="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex items-center gap-5">
        <!-- Percentage badge -->
        <div class="shrink-0 text-center">
          <p class="text-2xl font-bold text-gray-900 leading-none">{{ Math.round(ob.progress_percentage) }}<span
              class="text-sm font-semibold text-gray-400">%</span></p>
          <p class="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">min. 90%</p>
        </div>

        <!-- Progress bar -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-gray-600">Overall Progress</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-500"
              :style="{ width: `${ob.progress_percentage}%` }"></div>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-10 bg-gray-100 shrink-0"></div>

        <!-- Status + Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <StatusBadge :status="ob.status" />

          <template v-if="ob.status === 'in_progress'">
            <button @click="refreshProgress" :disabled="refreshing"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <ArrowPathIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': refreshing }" />
              {{ refreshing ? 'Refreshing...' : 'Refresh' }}
            </button>

            <button @click="showCompleteModal = true" :disabled="ob.progress_percentage < 90"
              :title="ob.progress_percentage < 90 ? `${Math.round(90 - ob.progress_percentage)}% more needed` : 'Mark this onboarding as complete'"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors">
              <CheckCircleIcon class="w-3.5 h-3.5" />
              Mark as Complete
            </button>
          </template>
        </div>
      </div>

      <!-- Client profile header card -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="p-5">
          <div class="flex gap-5 items-start">
            <!-- Circular avatar -->
            <div
              class="w-16 h-16 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="ob.client?.avatar_url" :src="ob.client.avatar_url" class="w-full h-full object-cover" />
              <UserCircleIcon v-else class="w-10 h-10 text-gray-300" />
            </div>

            <div class="flex-1 min-w-0">
              <h2 class="text-sm font-bold text-gray-900">
                {{ [ob.client?.company_name, ob.client?.phone].filter(Boolean).join(' | ') || ob.request_code }}
              </h2>

              <!-- Two-row meta grid (4 cols each row), matching reference layout -->
              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <!-- Row 1 -->
                <div class="flex items-center gap-1.5">
                  <UsersIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-700 truncate">
                    {{ ob.client?.contact_name || ob.client?.name || '—' }}
                    <template v-if="ob.client?.id"> | {{ ob.client.id }}</template>
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UserIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-700 truncate">{{ ob.sale?.name || '—' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    <span class="w-2.5 h-2.5 rounded-full border-2"
                      :class="accStatusActive ? 'border-primary bg-primary/20' : 'border-gray-300'"></span>
                  </div>
                  <span class="text-xs text-gray-500 shrink-0">Acc Status:</span>
                  <span class="text-xs font-medium ml-0.5"
                    :class="accStatusActive ? 'text-emerald-600' : 'text-gray-600'">
                    {{ ob.account_status ? capitalize(ob.account_status) : '—' }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <CalendarDaysIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-500 shrink-0">Acc Created at:</span>
                  <span class="text-xs text-gray-700 ml-0.5">{{ ob.account_created_at ?
                    formatDateTime(ob.account_created_at)
                    : '—' }}</span>
                </div>

                <!-- Row 2 -->
                <div class="flex items-center gap-1.5">
                  <UserIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-700 truncate">{{ ob.trainer?.name || '—' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <TableCellsIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-500 shrink-0">Created at:</span>
                  <span class="text-xs text-gray-700 ml-0.5">{{ ob.created_at ? formatDateTime(ob.created_at) : '—'
                    }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <DocumentTextIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-500 shrink-0">SO:</span>
                  <span class="text-xs text-gray-700 ml-0.5">{{ ob.so_number || '' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <CalendarDaysIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span class="text-xs text-gray-500 shrink-0">Acc Expired at:</span>
                  <span class="text-xs text-gray-700 ml-0.5">{{ ob.account_expired_at ?
                    formatDateTime(ob.account_expired_at)
                    : '—' }}</span>
                </div>
              </div>

              <!-- Location row -->
              <div class="mt-2 flex items-center gap-1.5">
                <MapPinIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span class="text-xs" :class="ob.client?.location ? 'text-primary' : 'text-gray-400'">
                  {{ ob.client?.location || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Company Information (full width) -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <!-- Card header -->
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <BuildingOfficeIcon class="w-4 h-4 text-gray-500" />
            <h3 class="text-sm font-semibold text-gray-900">Company Information</h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Patent: Upload if none, view if already uploaded -->
            <template v-if="patentPreviewUrl">
              <button @click="showPatentModal = true"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
                <CheckCircleIcon class="w-3.5 h-3.5" />
                Patent
              </button>
            </template>
            <template v-else>
              <label class="cursor-pointer">
                <input type="file" accept="image/*,.pdf" class="hidden" :disabled="ocrProcessing"
                  @change="handlePatentUpload" />
                <span :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  ocrProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                ]">
                  <ArrowUpTrayIcon class="w-3.5 h-3.5" />
                  {{ ocrProcessing ? 'Scanning...' : 'Upload Patent' }}
                </span>
              </label>
            </template>
            <!-- Save Change -->
            <button @click="saveCompanyInfo" :disabled="savingCompany"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ArrowDownTrayIcon class="w-3.5 h-3.5" />
              {{ savingCompany ? 'Saving...' : 'Save Change' }}
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div v-if="companyError" class="px-3 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {{ companyError }}
          </div>

          <!-- Company logo upload -->
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <img v-if="companyLogoPreview" :src="companyLogoPreview" class="w-full h-full object-cover" />
              <span v-else class="text-[10px] text-gray-400 text-center leading-tight px-2">Company<br />Logo</span>
            </div>
            <label class="cursor-pointer">
              <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
              <span
                class="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">Upload</span>
            </label>
          </div>

          <!-- Bilingual fields: English | Khmer -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- English -->
            <div class="space-y-4">
              <p class="text-sm font-medium text-gray-700">English</p>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">Company Name</label>
                <input v-model="companyForm.company_name" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">Type of Business</label>
                <select v-model="companyForm.business_type"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors appearance-none">
                  <option value="">Select an option</option>
                  <option v-for="bt in businessTypes" :key="bt.id" :value="bt.value || bt.id">
                    {{ bt.name_en }}
                  </option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">Owner's Name</label>
                <input v-model="companyForm.owner_name" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">Phone Number</label>
                <input v-model="companyForm.phone" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>
            </div>

            <!-- Khmer -->
            <div class="space-y-4">
              <p class="text-sm font-medium text-gray-700">Khmer</p>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">ឈ្មោះសហក្រាស</label>
                <input v-model="companyForm.company_name_kh" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">ប្រភេទអាជីវកម្ម</label>
                <!-- Same v-model as English so they always stay in sync -->
                <select v-model="companyForm.business_type"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors appearance-none">
                  <option value="">Select an option</option>
                  <option v-for="bt in businessTypes" :key="bt.id" :value="bt.value || bt.id">
                    {{ bt.name_km || bt.name_en }}
                  </option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">ឈ្មោះម្ចាស់សហក្រាស</label>
                <input v-model="companyForm.owner_name_kh" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-600">អាសយដ្ឋានសហក្រាស</label>
                <input v-model="companyForm.address_kh" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom two-column grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        <!-- Left column: System Analysis + HR Policies -->
        <div class="space-y-5">

          <!-- System Analysis -->
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <ChartBarIcon class="w-4 h-4 text-gray-500" />
                <h3 class="text-sm font-semibold text-gray-900">System Analysis</h3>
              </div>
              <button @click="saveAnalysis" :disabled="savingAnalysis"
                class="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
                {{ savingAnalysis ? 'Saving...' : 'Save' }}
              </button>
            </div>
            <div class="divide-y divide-gray-50">
              <div class="flex items-center gap-3 px-5 py-3.5">
                <span class="flex-1 text-sm text-gray-700">Import Employees</span>
                <input v-model.number="analysisForm.import_employee_count" type="number" min="0"
                  class="w-24 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div class="flex items-center gap-3 px-5 py-3.5">
                <span class="flex-1 text-sm text-gray-700">Connected Apps</span>
                <input v-model.number="analysisForm.connected_app_count" type="number" min="0"
                  class="w-24 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div class="flex items-center gap-3 px-5 py-3.5">
                <span class="flex-1 text-sm text-gray-700">Mobile Profiles</span>
                <input v-model.number="analysisForm.profile_mobile_count" type="number" min="0"
                  class="w-24 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div v-if="analysisError" class="px-5 pb-3 text-xs text-red-600">{{ analysisError }}</div>
          </div>

          <!-- Configure HR Policy -->
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center px-5 py-3.5 border-b border-gray-100 gap-2">
              <ShieldCheckIcon class="w-4 h-4 text-gray-500" />
              <h3 class="text-sm font-semibold text-gray-900">Configure HR Policy</h3>
            </div>

            <div class="divide-y divide-gray-50">
              <div v-if="!ob.policies?.length" class="px-5 py-6 text-center text-sm text-gray-400">
                No policies configured
              </div>
              <div v-for="p in ob.policies" :key="p.id" class="flex items-center gap-3 px-5 py-3">
                <button v-if="!p.is_checked" @click="checkPolicy(p.id)"
                  class="w-4 h-4 rounded border-2 border-gray-300 hover:border-primary flex-shrink-0 transition-colors bg-white"></button>
                <button v-else @click="uncheckPolicy(p.id)"
                  class="flex-shrink-0 text-emerald-500 hover:text-amber-500 transition-colors" title="Uncheck policy">
                  <CheckCircleIcon class="w-4 h-4" />
                </button>
                <span :class="['flex-1 text-sm', p.is_checked ? 'line-through text-gray-400' : 'text-gray-700']">
                  {{ p.policy_name }}
                </span>
                <span v-if="p.is_default" class="text-[10px] uppercase tracking-wider text-gray-400">default</span>
                <button v-if="!p.is_default && !p.is_checked" @click="promptRemovePolicy(p.id)"
                  class="text-xs text-gray-400 hover:text-red-500 transition-colors">Remove</button>
              </div>
            </div>

            <!-- Add policy area -->
            <div class="border-t border-gray-100 px-5 py-3">
              <div v-if="showAddPolicy" class="flex gap-2">
                <input v-model="newPolicyName" placeholder="Policy name..."
                  class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  @keyup.enter="addPolicy" autofocus />
                <button @click="addPolicy" :disabled="addingPolicy"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg disabled:opacity-60">
                  {{ addingPolicy ? '...' : 'Add' }}
                </button>
                <button @click="showAddPolicy = false; newPolicyName = ''"
                  class="px-2 text-gray-400 hover:text-gray-600">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
              <button v-else @click="showAddPolicy = true"
                class="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">+ Add More</button>
            </div>
          </div>
        </div>

        <!-- Right column: Lessons -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <PlayIcon class="w-4 h-4 text-gray-500" />
            <h3 class="text-sm font-semibold text-gray-900">Lessons</h3>
          </div>

          <!-- Pill-style Part tabs -->
          <div class="px-5 pt-4 pb-3">
            <div class="inline-flex items-center bg-gray-100 rounded-full p-0.5">
              <button v-for="pathNum in [1, 2, 3]" :key="pathNum"
                @click="activeLessonPath = pathNum; extraEmptySlots = 0" :class="[
                  'px-4 py-1.5 text-xs font-medium rounded-full transition-all',
                  activeLessonPath === pathNum
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]">
                Part {{ pathNum }}
              </button>
            </div>
          </div>

          <!-- Lesson slots -->
          <div class="divide-y divide-gray-100">
            <div v-for="(lesson, slotIdx) in slotsForCurrentPath" :key="slotIdx">

              <!-- Empty slot: click to pick from playlist -->
              <div v-if="!lesson" @click="openPlaylistPicker(slotIdx)"
                class="flex flex-col items-center justify-center py-8 gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <VideoCameraIcon class="w-6 h-6 text-primary" />
                </div>
                <span class="text-xs font-medium text-primary">Upload</span>
              </div>

              <!-- Filled slot -->
              <div v-else class="px-5 py-4 flex items-center gap-3">
                <!-- Thumbnail -->
                <div
                  class="w-16 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img v-if="getVideoThumb(lesson.lesson_video_url)" :src="getVideoThumb(lesson.lesson_video_url)"
                    class="w-full h-full object-cover" @error="$event.target.style.display = 'none'" />
                  <PlayIcon v-else class="w-5 h-5 text-gray-400" />
                </div>
                <!-- Title + URL -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-700 truncate">
                    Lesson {{ slotIdx + 1 }} - {{ youtubeTitles[lesson.lesson_video_url] || '...' }}
                  </p>
                  <a v-if="lesson.lesson_video_url" :href="lesson.lesson_video_url" target="_blank"
                    class="text-[10px] text-primary hover:underline inline-flex items-center gap-1">
                    <svg class="w-2.5 h-2.5 fill-red-500 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z" />
                      <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98" />
                    </svg>
                    Watch on YouTube
                  </a>
                </div>
                <!-- Actions -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <span v-if="lesson.is_sent"
                    class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircleIcon class="w-3 h-3" /> Sent
                  </span>
                  <template v-else>
                    <button @click="promptSendLesson(lesson)"
                      class="px-2.5 py-1 text-xs font-medium text-primary border border-primary/30 rounded hover:bg-primary/5 transition-colors">Send</button>
                    <button @click="promptDeleteLesson(lesson.id)"
                      class="px-2.5 py-1 text-xs text-gray-400 border border-gray-200 rounded hover:text-red-500 hover:border-red-300 transition-colors">Delete</button>
                  </template>
                </div>
              </div>

            </div>
          </div>

          <!-- Add More Lesson -->
          <div class="border-t border-gray-100 px-5 py-3">
            <button @click="extraEmptySlots++"
              class="text-xs font-medium text-primary hover:underline transition-colors">+
              Add More Lesson</button>
          </div>
        </div>
      </div>

      <!-- Playlist Picker Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showPlaylistModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            @click.self="closePlaylistPicker">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
              style="max-height: 82vh">
              <!-- Modal header -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div class="flex items-center gap-2">
                  <PlusIcon class="w-4 h-4 text-gray-600" />
                  <h3 class="text-sm font-semibold text-gray-900">Add More Lesson</h3>
                </div>
                <button @click="closePlaylistPicker"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>

              <!-- Playlist tabs -->
              <div class="px-5 pt-3 pb-3 flex gap-2 flex-wrap shrink-0 border-b border-gray-100">
                <div v-if="loadingPlaylist" class="text-xs text-gray-400 py-1">Loading playlists...</div>
                <template v-else>
                  <button v-for="pl in playlists" :key="pl.id" @click="switchPlaylistTab(pl.id)" :class="[
                    'px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap',
                    activePlaylistId === pl.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]">{{ pl.title }}</button>
                  <div v-if="playlists.length === 0" class="text-xs text-gray-400 py-1">No playlists found.</div>
                </template>
              </div>

              <!-- Video grid -->
              <div class="flex-1 overflow-y-auto p-5">
                <div v-if="loadingPlaylistVideos" class="text-center py-10 text-sm text-gray-400">Loading videos...
                </div>
                <div v-else-if="activePlaylistVideos.length === 0" class="text-center py-10">
                  <AcademicCapIcon class="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p class="text-sm text-gray-400">No videos in this playlist</p>
                </div>
                <div v-else class="grid grid-cols-3 gap-3">
                  <button v-for="video in activePlaylistVideos" :key="video.id"
                    @click="!isLessonUsed(video) && selectPlaylistLesson(video)" :disabled="isLessonUsed(video)" :class="[
                      'text-left rounded-lg overflow-hidden border-2 transition-all focus:outline-none',
                      isLessonUsed(video)
                        ? 'opacity-40 cursor-not-allowed border-transparent'
                        : pendingPlaylistLesson?.id === video.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-gray-300 cursor-pointer'
                    ]">
                    <!-- Thumbnail -->
                    <div class="aspect-video bg-gray-100 relative overflow-hidden">
                      <img v-if="getVideoThumb(video.youtube_url)" :src="getVideoThumb(video.youtube_url)"
                        class="w-full h-full object-cover" @error="$event.target.style.display = 'none'" />
                      <div class="absolute inset-0 flex items-center justify-center">
                        <PlayCircleIcon v-if="!getVideoThumb(video.youtube_url)" class="w-8 h-8 text-gray-300" />
                      </div>
                      <!-- Selected checkmark -->
                      <div v-if="pendingPlaylistLesson?.id === video.id"
                        class="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckIcon class="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <!-- Title -->
                    <p class="text-[10px] text-gray-600 p-2 leading-tight line-clamp-2">{{ video.title }}</p>
                  </button>
                </div>
              </div>

              <!-- Modal footer -->
              <div class="border-t border-gray-100 px-5 py-3 flex items-center justify-end gap-2 shrink-0">
                <button @click="closePlaylistPicker"
                  class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button @click="confirmPlaylistSelection" :disabled="!pendingPlaylistLesson || addingLesson"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                  {{ addingLesson ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

    </template>

    <!-- Empty state -->
    <div v-else-if="!loading" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <p class="text-sm text-gray-400">Onboarding record not found.</p>
    </div>

    <!-- Patent Certificate Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPatentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="!ocrProcessing && (showPatentModal = false)">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
            <!-- Modal header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <CheckCircleIcon class="w-4 h-4 text-primary" />
                <h3 class="text-sm font-semibold text-gray-900">Patent</h3>
              </div>
              <!-- Re-upload button inside modal -->
              <label v-if="!ocrProcessing" class="cursor-pointer">
                <input type="file" accept="image/*,.pdf" class="hidden" @change="handlePatentUpload" />
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <ArrowUpTrayIcon class="w-3.5 h-3.5" />
                  Replace
                </span>
              </label>
            </div>

            <!-- OCR progress (while scanning) -->
            <div v-if="ocrProcessing" class="px-5 py-4 space-y-2 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <span class="text-xs text-primary font-medium">Scanning document…</span>
                <span class="text-xs text-gray-500">{{ ocrProgress }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-primary h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${ocrProgress}%` }"></div>
              </div>
              <p class="text-[10px] text-gray-400">
                {{ ocrProgress < 60 ? 'Uploading document to server…' : 'Extracting text (English + Khmer)…' }} </p>
            </div>

            <!-- OCR error -->
            <div v-if="ocrError && !ocrProcessing"
              class="mx-5 mt-4 flex items-center gap-2 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon class="w-3.5 h-3.5 shrink-0" />
              {{ ocrError }}
            </div>

            <!-- OCR result panel -->
            <Transition name="fade">
              <div v-if="showOcrPanel && ocrResult && !ocrProcessing"
                class="mx-5 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 overflow-hidden">
                <div class="flex items-center justify-between px-3 py-2 bg-emerald-100/60 border-b border-emerald-200">
                  <div class="flex items-center gap-1.5">
                    <CheckCircleIcon class="w-3.5 h-3.5 text-emerald-600" />
                    <span class="text-xs font-semibold text-emerald-800">OCR Result — Review before applying</span>
                  </div>
                  <button @click="dismissOcrPanel" class="p-0.5 text-emerald-600 hover:text-emerald-800">
                    <XMarkIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
                <div class="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div v-if="ocrResult.company_name" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Company (EN)</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.company_name }}</span>
                  </div>
                  <div v-if="ocrResult.company_name_kh" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Company (KH)</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.company_name_kh }}</span>
                  </div>
                  <div v-if="ocrResult.owner_name" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Owner (EN)</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.owner_name }}</span>
                  </div>
                  <div v-if="ocrResult.owner_name_kh" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Owner (KH)</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.owner_name_kh }}</span>
                  </div>
                  <div v-if="ocrResult.phone" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Phone</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.phone }}</span>
                  </div>
                  <div v-if="ocrResult.address_kh" class="flex items-start gap-2 text-xs">
                    <span class="text-gray-500 shrink-0 w-24">Address (KH)</span>
                    <span class="text-gray-800 font-medium">{{ ocrResult.address_kh }}</span>
                  </div>
                </div>
                <div class="px-3 pb-3 flex justify-end">
                  <button @click="applyOcrResult"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                    <CheckCircleIcon class="w-3.5 h-3.5" />
                    Apply to Form
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Modal body: fields left, certificate image right -->
            <div
              class="flex flex-col sm:flex-row gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 max-h-[60vh] overflow-y-auto">
              <!-- Left: company fields from form -->
              <div class="sm:w-64 shrink-0 p-5 space-y-4">
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">ឈ្មោះសហក្រាស</p>
                  <p class="text-sm text-gray-800">{{ companyForm.company_name_kh || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Company Name</p>
                  <p class="text-sm text-gray-800">{{ companyForm.company_name || ob?.client?.company_name || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">ឈ្មោះម្ចាស់</p>
                  <p class="text-sm text-gray-800">{{ companyForm.owner_name_kh || companyForm.owner_name || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Phone</p>
                  <p class="text-sm font-mono text-gray-800">{{ companyForm.phone || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">អាសយដ្ឋាន</p>
                  <p class="text-sm text-gray-800 leading-relaxed">{{ companyForm.address_kh || '—' }}</p>
                </div>
              </div>

              <!-- Right: patent certificate image -->
              <div class="flex-1 p-4 flex items-center justify-center bg-gray-50 min-h-[260px]">
                <img v-if="patentPreviewUrl && !ocrProcessing" :src="patentPreviewUrl" alt="Patent Certificate"
                  class="max-w-full max-h-[50vh] object-contain rounded border border-gray-200 shadow-sm" />
                <div v-else-if="ocrProcessing" class="text-center">
                  <ArrowPathIcon class="w-8 h-8 text-primary/40 mx-auto mb-2 animate-spin" />
                  <p class="text-sm text-gray-400">Scanning…</p>
                </div>
                <div v-else class="text-center">
                  <DocumentTextIcon class="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p class="text-sm text-gray-400">No patent certificate uploaded</p>
                </div>
              </div>
            </div>

            <!-- Modal footer -->
            <div class="flex justify-end px-5 py-3 border-t border-gray-100">
              <button :disabled="ocrProcessing" @click="showPatentModal = false"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <XMarkIcon class="w-3.5 h-3.5" />
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modals -->
    <ConfirmModal :open="showCompleteModal" title="Mark Onboarding Complete"
      message="Are you sure this onboarding is ready to be marked as completed?" confirm-text="Mark Complete"
      type="warning" @confirm="handleComplete" @cancel="showCompleteModal = false" />
    <ConfirmModal :open="showRemovePolicyModal" title="Remove Policy"
      message="Are you sure you want to remove this policy?" confirm-text="Remove" type="danger"
      @confirm="confirmRemovePolicy" @cancel="showRemovePolicyModal = false" />
    <!-- Send Lesson Preview Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSendPreviewModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          @click.self="showSendPreviewModal = false">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <PaperAirplaneIcon class="w-4 h-4 text-gray-600" />
                <h3 class="text-sm font-semibold text-gray-900">Preview</h3>
              </div>
              <button @click="showSendPreviewModal = false" class="p-1 text-gray-400 hover:text-gray-600 rounded">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
            <!-- Body -->
            <div class="p-5 space-y-4">
              <!-- Video preview row -->
              <div v-if="sendPreviewLesson" class="flex items-center gap-3">
                <div class="w-20 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                  <img v-if="getVideoThumb(sendPreviewLesson.lesson_video_url)"
                    :src="getVideoThumb(sendPreviewLesson.lesson_video_url)" class="w-full h-full object-cover"
                    @error="$event.target.style.display = 'none'" />
                </div>
                <p class="text-sm font-medium text-gray-800 leading-snug">
                  {{ sendPreviewLesson.title || sendPreviewLesson.lesson_video_url }}
                </p>
              </div>
              <!-- Message -->
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-gray-700">Telegram Message <span
                    class="text-gray-400">(optional)</span></label>
                <textarea v-model="sendPreviewMessage" rows="4"
                  placeholder="Add a message to send along with the video..."
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none" />
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button @click="showSendPreviewModal = false"
                class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button @click="confirmSendLesson" :disabled="sendingLesson"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
                <PaperAirplaneIcon class="w-3.5 h-3.5" />
                {{ sendingLesson ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <ConfirmModal :open="showDeleteLessonModal" title="Delete Lesson"
      message="Are you sure you want to delete this lesson? This cannot be undone." confirm-text="Delete" type="danger"
      @confirm="confirmDeleteLesson" @cancel="showDeleteLessonModal = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PlayCircleIcon,
  VideoCameraIcon,
  PlusIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { getPlaylists, getVideos, extractYouTubeId, getYouTubeThumbnail } from '@/modules/shared/services/lessonService.js'
import { businessTypeService } from '@/modules/shared/services/businessTypeService.js'
import { useOCR } from '@/modules/shared/composables/useOCR.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDate, formatDateTimeFromISO } = useDateTime()

const LESSON_PATHS = [1, 2, 3]

function getViewStateKey() {
  return `onboarding-detail:view-state:${route.params.id || 'unknown'}`
}

function saveViewState() {
  try {
    const payload = {
      activeLessonPath: activeLessonPath.value,
      scrollY: window.scrollY,
    }
    sessionStorage.setItem(getViewStateKey(), JSON.stringify(payload))
  } catch {
    // Ignore browser storage errors.
  }
}

function restoreViewState() {
  try {
    const raw = sessionStorage.getItem(getViewStateKey())
    if (!raw) return null
    const state = JSON.parse(raw)
    const restoredPath = Number(state?.activeLessonPath)
    if (LESSON_PATHS.includes(restoredPath)) {
      activeLessonPath.value = restoredPath
    }
    return state
  } catch {
    return null
  }
}

function handleWindowScroll() {
  saveViewState()
}

function handleBeforeUnload() {
  saveViewState()
}

function restoreScrollPosition(scrollY) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'auto' })
    })
  })
}

function formatDateTime(val) {
  if (!val) return '—'
  try { return formatDateTimeFromISO(val) } catch { return formatDate(val) }
}

const ob = ref(null)
const loading = ref(true)
const refreshing = ref(false)

// Modal states
const showCompleteModal = ref(false)
const showRemovePolicyModal = ref(false)
const removePolicyId = ref(null)
const showSendPreviewModal = ref(false)
const sendPreviewLesson = ref(null)
const sendPreviewMessage = ref('')
const sendingLesson = ref(false)
const showDeleteLessonModal = ref(false)
const deleteLessonId = ref(null)

// Account status helper
const accStatusActive = computed(() => {
  const s = ob.value?.account_status?.toLowerCase()
  return s === 'active' || s === 'activated'
})

// Lessons — path tabs + slot management
const activeLessonPath = ref(1)
const extraEmptySlots = ref(0)

const lessonsForCurrentPath = computed(() =>
  (ob.value?.lessons || []).filter(l => Number(l.path) === activeLessonPath.value)
)

// 3 default slots + any extra; each slot is a lesson object or null (empty)
const slotsForCurrentPath = computed(() => {
  const existing = lessonsForCurrentPath.value
  const slotted = []
  let fallbackSlot = 1

  for (const lesson of existing) {
    let slot = Number(lesson?.slot_index)

    if (!Number.isInteger(slot) || slot < 1) {
      while (slotted[fallbackSlot - 1]) fallbackSlot++
      slot = fallbackSlot
    } else if (slotted[slot - 1]) {
      while (slotted[fallbackSlot - 1]) fallbackSlot++
      slot = fallbackSlot
    }

    slotted[slot - 1] = lesson
    fallbackSlot = Math.max(fallbackSlot, slot + 1)
  }

  const total = Math.max(3, slotted.length) + extraEmptySlots.value
  return Array.from({ length: total }, (_, i) => slotted[i] || null)
})

// All video URLs already assigned anywhere in this onboarding (to gray out in picker)
const usedLessonUrls = computed(() =>
  new Set((ob.value?.lessons || []).map(l => l.lesson_video_url).filter(Boolean))
)

// Reset extra slots when switching paths
watch(activeLessonPath, () => {
  extraEmptySlots.value = 0
  saveViewState()
})

// Playlist picker modal
const showPlaylistModal = ref(false)
const loadingPlaylist = ref(false)
const loadingPlaylistVideos = ref(false)
const playlists = ref([])
const activePlaylistId = ref(null)
const activePlaylistVideos = ref([])
const pendingPlaylistLesson = ref(null)
const pendingSlotIndex = ref(null)

function getVideoThumb(url) {
  const id = extractYouTubeId(url)
  return id ? getYouTubeThumbnail(id) : null
}

function isLessonUsed(video) {
  return usedLessonUrls.value.has(video.youtube_url)
}

function selectPlaylistLesson(video) {
  pendingPlaylistLesson.value = pendingPlaylistLesson.value?.id === video.id ? null : video
}

async function switchPlaylistTab(playlistId) {
  if (activePlaylistId.value === playlistId) return
  activePlaylistId.value = playlistId
  pendingPlaylistLesson.value = null
  loadingPlaylistVideos.value = true
  try {
    activePlaylistVideos.value = await getVideos(playlistId)
  } catch {
    activePlaylistVideos.value = []
  } finally {
    loadingPlaylistVideos.value = false
  }
}

async function openPlaylistPicker(slotIdx = null) {
  pendingPlaylistLesson.value = null
  pendingSlotIndex.value = slotIdx
  showPlaylistModal.value = true
  if (playlists.value.length === 0) {
    loadingPlaylist.value = true
    try {
      const res = await getPlaylists({ per_page: 100 })
      playlists.value = res.data || []
      if (playlists.value.length) await switchPlaylistTab(playlists.value[0].id)
    } catch {
      playlists.value = []
    } finally {
      loadingPlaylist.value = false
    }
  }
}

function closePlaylistPicker() {
  showPlaylistModal.value = false
  pendingPlaylistLesson.value = null
  pendingSlotIndex.value = null
}

async function confirmPlaylistSelection() {
  if (!pendingPlaylistLesson.value || pendingSlotIndex.value === null) return
  addingLesson.value = true
  try {
    await onboardingService.addLesson(ob.value.id, {
      path: activeLessonPath.value,
      slot_index: pendingSlotIndex.value + 1,
      lesson_video_url: pendingPlaylistLesson.value.youtube_url,
    })
    if (extraEmptySlots.value > 0) extraEmptySlots.value--
    closePlaylistPicker()
    toast.success('Lesson added.')
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add lesson.')
  } finally {
    addingLesson.value = false
  }
}

// Patent modal
const showPatentModal = ref(false)

// Company Info
const companyForm = reactive({
  company_name: '',
  company_name_kh: '',
  business_type: '',    // shared by both EN and KH selects → auto-sync
  owner_name: '',
  owner_name_kh: '',
  phone: '',
  address_kh: '',
  is_completed: false,
})
const companyOriginal = ref({})  // snapshot for dirty tracking
const companyLogoPreview = ref(null)    // data URI (local) or CDN URL — for <img> display
const companyLogoBase64 = ref(null)     // Base64 data URI to send on save → backend uploads to Cloudinary
const savingCompany = ref(false)
const companyError = ref(null)

// Patent: Base64 for image files only (PDFs are OCR-only, no preview storage)
const patentDocumentBase64 = ref(null)

const COMPANY_FIELDS = ['company_name', 'company_name_kh', 'business_type', 'owner_name', 'owner_name_kh', 'phone', 'address_kh']

const companyDirty = computed(() => {
  if (companyLogoBase64.value) return true      // new logo ready to persist
  if (patentDocumentBase64.value) return true   // new patent image ready to persist
  return COMPANY_FIELDS.some(k => companyForm[k] !== (companyOriginal.value[k] ?? ''))
})

function handleLogoUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    companyLogoBase64.value = event.target.result   // data:image/...;base64,...
    companyLogoPreview.value = event.target.result   // local preview until CDN URL returned
  }
  reader.readAsDataURL(file)
}

// Business Types — loaded from API
const businessTypes = ref([])

async function loadBusinessTypes() {
  try {
    const res = await businessTypeService.getAll({ per_page: 100 })
    businessTypes.value = (res.data || [])
  } catch {
    businessTypes.value = []
  }
}

// OCR — patent document auto-fill
const { processing: ocrProcessing, progress: ocrProgress, error: ocrError, processFile: ocrProcessFile } = useOCR()
const patentFile = ref(null)
const patentPreviewUrl = ref(null)
const patentFileName = ref('')
const ocrResult = ref(null)
const showOcrPanel = ref(false)

async function handlePatentUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  patentFile.value = file
  patentFileName.value = file.name
  ocrResult.value = null
  showOcrPanel.value = false
  patentDocumentBase64.value = null

  if (file.type.startsWith('image/')) {
    // Show local preview and read Base64 for later Cloudinary upload (via backend on save)
    patentPreviewUrl.value = URL.createObjectURL(file)
    const reader = new FileReader()
    reader.onload = (event) => { patentDocumentBase64.value = event.target.result }
    reader.readAsDataURL(file)
  } else {
    // PDF — OCR only; no image preview can be stored
    patentPreviewUrl.value = null
  }

  // Open modal immediately so OCR progress is visible
  showPatentModal.value = true

  // Run OCR via backend (POST /companies/extract-document, multipart)
  const result = await ocrProcessFile(file)
  if (result) {
    const hasData = Object.values(result).some(v => v !== '')
    ocrResult.value = result
    showOcrPanel.value = hasData
    if (!hasData) {
      toast.warning('OCR completed but no fields could be extracted. Please fill in manually.')
    }
  }
}

function applyOcrResult() {
  if (!ocrResult.value) return
  const r = ocrResult.value
  if (r.company_name) companyForm.company_name = r.company_name
  if (r.company_name_kh) companyForm.company_name_kh = r.company_name_kh
  if (r.owner_name) companyForm.owner_name = r.owner_name
  if (r.owner_name_kh) companyForm.owner_name_kh = r.owner_name_kh
  if (r.phone) companyForm.phone = r.phone
  if (r.address_kh) companyForm.address_kh = r.address_kh
  if (r.business_type) companyForm.business_type = r.business_type
  showOcrPanel.value = false
  showPatentModal.value = false
  toast.success('OCR data applied. Please review and save.')
}

function dismissOcrPanel() {
  showOcrPanel.value = false
}

// System Analysis
const analysisForm = reactive({ import_employee_count: 0, connected_app_count: 0, profile_mobile_count: 0 })
const savingAnalysis = ref(false)
const analysisError = ref(null)

// Policies
const showAddPolicy = ref(false)
const newPolicyName = ref('')
const addingPolicy = ref(false)

// Lessons
const addingLesson = ref(false)

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function load() {
  loading.value = true
  try {
    const response = await onboardingService.getOnboarding(route.params.id)
    ob.value = response.data
    const ci = ob.value?.company_info
    if (ci) {
      // All company data is serialized as JSON inside the `content` field
      let content = {}
      try {
        content = ci.content ? JSON.parse(ci.content) : {}
      } catch {
        content = {}
      }
      companyForm.company_name = content.company_name || ''
      companyForm.company_name_kh = content.company_name_kh || ''
      companyForm.business_type = content.business_type || ''
      companyForm.owner_name = content.owner_name || ''
      companyForm.owner_name_kh = content.owner_name_kh || ''
      companyForm.phone = content.phone || ''
      companyForm.address_kh = content.address_kh || ''
      companyForm.is_completed = ci.is_completed || false
      // Restore CDN URLs saved by the backend after previous Cloudinary uploads
      if (content.logo_url) {
        companyLogoPreview.value = content.logo_url  // show saved CDN logo
        companyLogoBase64.value = null               // no pending upload
      }
      if (content.patent_image_url) {
        patentPreviewUrl.value = content.patent_image_url  // patent modal certificate
        patentDocumentBase64.value = null
      }
      // Snapshot for dirty tracking
      Object.assign(companyOriginal.value, Object.fromEntries(COMPANY_FIELDS.map(k => [k, companyForm[k]])))
    }
    const sa = ob.value?.system_analysis
    if (sa) {
      analysisForm.import_employee_count = sa.import_employee_count || 0
      analysisForm.connected_app_count = sa.connected_app_count || 0
      analysisForm.profile_mobile_count = sa.profile_mobile_count || 0
    }
    fetchLessonTitles()
  } catch {
    ob.value = null
  } finally {
    loading.value = false
  }
}

//  YouTube title cache
const youtubeTitles = ref({})

async function fetchLessonTitles() {
  const urls = (ob.value?.lessons || [])
    .map(l => l.lesson_video_url)
    .filter(url => url && !youtubeTitles.value[url])

  const results = await Promise.allSettled(
    urls.map(async url => {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (res.ok) {
        const data = await res.json()
        return [url, data.title]
      }
    })
  )
  const titles = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) titles[r.value[0]] = r.value[1]
  }
  if (Object.keys(titles).length) Object.assign(youtubeTitles.value, titles)
}

async function refreshProgress() {
  refreshing.value = true
  try {
    const response = await onboardingService.refreshProgress(ob.value.id)
    ob.value.progress_percentage = response.data?.progress_percentage ?? ob.value.progress_percentage
    toast.success('Progress refreshed.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to refresh.')
  } finally {
    refreshing.value = false
  }
}

async function saveCompanyInfo() {
  savingCompany.value = true
  companyError.value = null
  try {
    // The backend OnboardingCompanyInfo model stores all structured fields as a JSON blob in `content`.
    // Build the content object, preserving existing logo_base64 if no new logo was uploaded.
    let existingContent = {}
    try {
      const savedContent = ob.value?.company_info?.content
      existingContent = savedContent ? JSON.parse(savedContent) : {}
    } catch { /* ignore */ }

    // Structured company fields go into the `content` JSON blob.
    // logo_url and patent_image_url are NOT set here — the backend merges them
    // after uploading the Base64 fields to Cloudinary.
    const contentData = {
      ...existingContent,
      company_name: companyForm.company_name,
      company_name_kh: companyForm.company_name_kh,
      business_type: companyForm.business_type,
      owner_name: companyForm.owner_name,
      owner_name_kh: companyForm.owner_name_kh,
      phone: companyForm.phone,
      address_kh: companyForm.address_kh,
    }

    const payload = {
      content: JSON.stringify(contentData),
      is_completed: companyForm.is_completed,
    }
    // Send Base64 data URIs as top-level fields — backend uploads them to Cloudinary
    // and stores the resulting CDN URLs inside `content` (same pattern as appointment proofs)
    if (companyLogoBase64.value) payload.logo_base64 = companyLogoBase64.value
    if (patentDocumentBase64.value) payload.patent_document_base64 = patentDocumentBase64.value

    const res = await onboardingService.updateCompanyInfo(ob.value.id, payload)

    // Update local company_info so next save picks up the CDN URLs added by the backend
    if (res.data) ob.value.company_info = res.data

    // Reset dirty state
    companyLogoBase64.value = null
    patentDocumentBase64.value = null
    Object.assign(companyOriginal.value, Object.fromEntries(COMPANY_FIELDS.map(k => [k, companyForm[k]])))
    toast.success('Company info saved.')
  } catch (err) {
    companyError.value = err.response?.data?.message || 'Failed to save.'
    toast.error(companyError.value)
  } finally {
    savingCompany.value = false
  }
}

async function saveAnalysis() {
  savingAnalysis.value = true
  analysisError.value = null
  try {
    await onboardingService.updateSystemAnalysis(ob.value.id, analysisForm)
    toast.success('System analysis saved.')
  } catch (err) {
    analysisError.value = err.response?.data?.message || 'Failed to save.'
  } finally {
    savingAnalysis.value = false
  }
}

async function addPolicy() {
  if (!newPolicyName.value.trim()) return
  addingPolicy.value = true
  try {
    await onboardingService.addPolicy(ob.value.id, newPolicyName.value.trim())
    newPolicyName.value = ''
    showAddPolicy.value = false
    toast.success('Policy added.')
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  } finally {
    addingPolicy.value = false
  }
}

async function checkPolicy(policyId) {
  try {
    await onboardingService.checkPolicy(ob.value.id, policyId)
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

async function uncheckPolicy(policyId) {
  try {
    await onboardingService.uncheckPolicy(ob.value.id, policyId)
    toast.success('Policy unchecked.')
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

function promptRemovePolicy(policyId) {
  removePolicyId.value = policyId
  showRemovePolicyModal.value = true
}

async function confirmRemovePolicy() {
  try {
    await onboardingService.removePolicy(ob.value.id, removePolicyId.value)
    showRemovePolicyModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}


function promptSendLesson(lesson) {
  sendPreviewLesson.value = lesson
  sendPreviewMessage.value = ''
  showSendPreviewModal.value = true
}

async function confirmSendLesson() {
  if (!sendPreviewLesson.value) return
  sendingLesson.value = true
  try {
    await onboardingService.sendLesson(ob.value.id, sendPreviewLesson.value.id, sendPreviewMessage.value.trim() || undefined)
    toast.success('Lesson sent!')
    showSendPreviewModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to send.')
  } finally {
    sendingLesson.value = false
  }
}

function promptDeleteLesson(lessonId) {
  deleteLessonId.value = lessonId
  showDeleteLessonModal.value = true
}

async function confirmDeleteLesson() {
  try {
    await onboardingService.deleteLesson(ob.value.id, deleteLessonId.value)
    showDeleteLessonModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

async function handleComplete() {
  try {
    await onboardingService.completeOnboarding(ob.value.id)
    toast.success('Onboarding completed!')
    showCompleteModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to complete.')
  }
}

onMounted(async () => {
  const restoredState = restoreViewState()

  await load()
  await loadBusinessTypes()

  if (typeof restoredState?.scrollY === 'number' && restoredState.scrollY >= 0) {
    await nextTick()
    restoreScrollPosition(restoredState.scrollY)
  }

  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  saveViewState()
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
