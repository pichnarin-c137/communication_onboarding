<template>
  <div class="flex flex-col gap-4 mt-3 h-full">

    <!-- Page header -->
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Playlists</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage training video playlists for onboarding</p>
      </div>
      <button
        @click="openCreatePlaylist"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        New Playlist
      </button>
    </div>

    <!-- Main split layout -->
    <div class="flex gap-4 min-h-0 flex-1">

      <!--  Left: Playlist list  -->
      <div class="w-64 shrink-0 flex flex-col gap-2">
        <!-- Search -->
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="playlistSearch"
            type="text"
            placeholder="Search playlists..."
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <!-- Playlist loading -->
        <div v-if="playlistsLoading" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <!-- Playlist list -->
        <div v-else class="flex flex-col gap-1 overflow-y-auto">
          <div
            v-for="pl in filteredPlaylists"
            :key="pl.id"
            @click="selectPlaylist(pl)"
            :class="[
              'group flex items-start justify-between gap-2 px-3 py-3 rounded-lg cursor-pointer border transition-colors',
              selectedPlaylist?.id === pl.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <div class="flex-1 min-w-0">
              <p :class="['text-sm font-medium truncate', selectedPlaylist?.id === pl.id ? 'text-blue-700' : 'text-gray-900']">
                {{ pl.title }}
              </p>
              <div class="flex items-center gap-2 mt-0.5">
                <span :class="['text-xs', selectedPlaylist?.id === pl.id ? 'text-blue-500' : 'text-gray-400']">
                  {{ pl.video_count ?? 0 }} videos
                </span>
                <span
                  :class="[
                    'text-[10px] px-1.5 py-0.5 rounded font-medium',
                    pl.is_public
                      ? selectedPlaylist?.id === pl.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      : selectedPlaylist?.id === pl.id ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'
                  ]"
                >{{ pl.is_public ? 'Public' : 'Private' }}</span>
              </div>
            </div>
            <!-- Kebab actions -->
            <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100" @click.stop>
              <button
                @click="openEditPlaylist(pl)"
                :class="['p-1 rounded transition-colors', selectedPlaylist?.id === pl.id ? 'text-blue-400 hover:text-blue-700' : 'text-gray-400 hover:text-gray-700']"
                title="Edit playlist"
              >
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button
                @click="promptDeletePlaylist(pl)"
                :class="['p-1 rounded transition-colors', selectedPlaylist?.id === pl.id ? 'text-blue-300 hover:text-red-500' : 'text-gray-400 hover:text-red-500']"
                title="Delete playlist"
              >
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Playlist empty state -->
          <div v-if="filteredPlaylists.length === 0 && !playlistsLoading" class="py-8 text-center">
            <QueueListIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-xs text-gray-400">
              {{ playlistSearch ? 'No playlists match.' : 'No playlists yet.' }}
            </p>
            <button v-if="!playlistSearch" @click="openCreatePlaylist"
              class="mt-2 text-xs text-gray-600 underline">
              Create one
            </button>
          </div>
        </div>
      </div>

      <!--  Right: Video panel  -->
      <div class="flex-1 min-w-0 flex flex-col">

        <!-- No playlist selected -->
        <div v-if="!selectedPlaylist" class="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-xl">
          <div class="text-center py-12">
            <QueueListIcon class="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p class="text-sm font-medium text-gray-500">Select a playlist</p>
            <p class="text-xs text-gray-400 mt-1">Choose a playlist from the left to view its videos</p>
          </div>
        </div>

        <!-- Playlist detail -->
        <template v-else>
          <!-- Playlist header card -->
          <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 shrink-0 mb-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-base font-semibold text-gray-900">{{ selectedPlaylist.title }}</h2>
                  <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                    {{ selectedPlaylist.is_public ? 'Public' : 'Private' }}
                  </span>
                </div>
                <p v-if="selectedPlaylist.description" class="text-sm text-gray-500 mt-1">{{ selectedPlaylist.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ videos.length }} video{{ videos.length !== 1 ? 's' : '' }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <!-- <button
                  @click="openSendPlaylist"
                  :disabled="videos.length === 0"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Send playlist to Telegram"
                >
                  <PaperAirplaneIcon class="w-3.5 h-3.5" />
                  Send to Telegram
                </button> -->
                <button
                  @click="openAddVideo"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon class="w-3.5 h-3.5" />
                  Add Video
                </button>
              </div>
            </div>
          </div>

          <!-- Videos loading -->
          <div v-if="videosLoading" class="flex flex-col gap-2">
            <div v-for="i in 4" :key="i" class="h-16 bg-white border border-gray-200 rounded-lg animate-pulse" />
          </div>

          <!-- Videos empty state -->
          <div
            v-else-if="videos.length === 0"
            class="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-xl"
          >
            <div class="text-center py-12">
              <FilmIcon class="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p class="text-sm font-medium text-gray-500">No videos in this playlist</p>
              <p class="text-xs text-gray-400 mt-1">Add your first training video to get started</p>
              <button @click="openAddVideo"
                class="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <PlusIcon class="w-3.5 h-3.5" /> Add Video
              </button>
            </div>
          </div>

          <!-- Video list -->
          <div v-else class="flex flex-col gap-2 overflow-y-auto">
            <div
              v-for="(video, index) in videos"
              :key="video.id"
              class="group flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <!-- Position -->
              <span class="text-xs text-gray-400 font-mono w-5 shrink-0 text-center">{{ video.position }}</span>

              <!-- Thumbnail -->
              <div class="w-20 h-12 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                <img
                  v-if="getVideoThumbnail(video.youtube_url)"
                  :src="getVideoThumbnail(video.youtube_url)"
                  :alt="video.title"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <div class="absolute inset-0 flex items-center justify-center">
                  <a :href="video.youtube_url" target="_blank" @click.stop
                    class="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                    <PlayIcon class="w-3 h-3 text-white ml-0.5" />
                  </a>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ video.title }}</p>
                <p v-if="video.description" class="text-xs text-gray-400 truncate mt-0.5">{{ video.description }}</p>
                <a :href="video.youtube_url" target="_blank" @click.stop
                  class="text-[10px] text-gray-400 hover:text-primary inline-flex items-center gap-1 mt-0.5">
                  <svg class="w-2.5 h-2.5 fill-red-500 shrink-0" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/><polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98"/></svg>
                  Watch on YouTube
                </a>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- Reorder up -->
                <button
                  @click="moveVideo(index, -1)"
                  :disabled="index === 0 || reordering"
                  class="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                  title="Move up"
                >
                  <ChevronUpIcon class="w-4 h-4" />
                </button>
                <!-- Reorder down -->
                <button
                  @click="moveVideo(index, 1)"
                  :disabled="index === videos.length - 1 || reordering"
                  class="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                  title="Move down"
                >
                  <ChevronDownIcon class="w-4 h-4" />
                </button>
                <!-- Edit -->
                <button
                  @click="openEditVideo(video)"
                  class="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  title="Edit video"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <!-- Delete -->
                <button
                  @click="promptDeleteVideo(video)"
                  class="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="Delete video"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!--  Create / Edit Playlist Modal  -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showPlaylistModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        @click.self="closePlaylistModal"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ editingPlaylist ? 'Edit Playlist' : 'New Playlist' }}</h3>
            <button @click="closePlaylistModal" class="p-1 text-gray-400 hover:text-gray-600 rounded">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
              <input
                v-model="playlistForm.title"
                type="text"
                maxlength="255"
                placeholder="e.g. Onboarding Week 1"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                v-model="playlistForm.description"
                rows="2"
                placeholder="Optional description..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              />
            </div>
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" v-model="playlistForm.is_public" class="sr-only" />
              <div :class="['w-9 h-5 rounded-full transition-colors relative shrink-0', playlistForm.is_public ? 'bg-gray-900' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', playlistForm.is_public ? 'translate-x-[18px]' : 'translate-x-0.5']" />
              </div>
              <span class="text-sm text-gray-700">Public playlist</span>
              <span class="text-xs text-gray-400">(visible to others)</span>
            </label>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
            <button @click="closePlaylistModal" class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              @click="savePlaylist"
              :disabled="!playlistForm.title.trim() || playlistSaving"
              class="px-4 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ playlistSaving ? 'Saving...' : editingPlaylist ? 'Save Changes' : 'Create Playlist' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!--  Add / Edit Video Modal  -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showVideoModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        @click.self="closeVideoModal"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ editingVideo ? 'Edit Video' : 'Add Video' }}</h3>
            <button @click="closeVideoModal" class="p-1 text-gray-400 hover:text-gray-600 rounded">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <!-- YouTube URL -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">YouTube URL <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <input
                  v-model="videoForm.youtube_url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  @keyup.enter="fetchMeta"
                />
                <button
                  @click="fetchMeta"
                  :disabled="!videoForm.youtube_url || fetchingMeta"
                  class="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 shrink-0"
                >
                  <ArrowPathIcon v-if="fetchingMeta" class="w-4 h-4 animate-spin" />
                  <span v-else>Fetch</span>
                </button>
              </div>
              <p v-if="fetchError" class="text-xs text-red-600">{{ fetchError }}</p>
              <p class="text-xs text-gray-400">Supports youtube.com/watch?v= and youtu.be/ links</p>
            </div>

            <!-- Preview after fetch -->
            <div v-if="videoPreview.thumbnail" class="flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <img :src="videoPreview.thumbnail" class="w-24 h-14 object-cover rounded shrink-0" @error="videoPreview.thumbnail = ''" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{{ videoPreview.title }}</p>
                <p v-if="videoPreview.author" class="text-[10px] text-gray-500 mt-0.5">{{ videoPreview.author }}</p>
              </div>
            </div>

            <!-- Title -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
              <input
                v-model="videoForm.title"
                type="text"
                maxlength="255"
                placeholder="Video title"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                v-model="videoForm.description"
                rows="2"
                placeholder="Optional description..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
            <button @click="closeVideoModal" class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              @click="saveVideo"
              :disabled="!videoForm.youtube_url || !videoForm.title.trim() || videoSaving"
              class="px-4 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ videoSaving ? 'Saving...' : editingVideo ? 'Save Changes' : 'Add Video' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!--  Send to Telegram Modal  -->
  <!-- <Teleport to="body">
    <Transition name="fade">
      <div v-if="showSendModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        @click.self="closeSendModal"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Send to Telegram</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ sendTarget === 'playlist' ? `Playlist: ${selectedPlaylist?.title}` : `Video: ${sendingVideo?.title}` }}
              </p>
            </div>
            <button @click="closeSendModal" class="p-1 text-gray-400 hover:text-gray-600 rounded">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Chat ID <span class="text-red-500">*</span></label>
              <input
                v-model="sendForm.chat_id"
                type="text"
                placeholder="-100123456789"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p class="text-xs text-gray-400">The Telegram group or channel chat ID (e.g. -100123456789)</p>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Message <span class="text-gray-400">(optional)</span></label>
              <textarea
                v-model="sendForm.message"
                rows="2"
                :placeholder="sendTarget === 'playlist' ? 'e.g. This week\'s training materials.' : 'e.g. Watch this before our session.'"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
            <button @click="closeSendModal" class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              @click="confirmSend"
              :disabled="!sendForm.chat_id.trim() || sending"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon class="w-3.5 h-3.5" />
              {{ sending ? 'Queuing...' : 'Send' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport> -->

  <!--  Delete confirm modal  -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showDeleteModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
              <TrashIcon class="w-4 h-4 text-red-500" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ deleteTarget === 'playlist' ? 'Delete Playlist' : 'Delete Video' }}</h3>
              <p class="text-xs text-gray-500 mt-1">
                <template v-if="deleteTarget === 'playlist'">
                  Delete <span class="font-medium text-gray-700">{{ deletingPlaylist?.title }}</span> and all its videos? This cannot be undone.
                </template>
                <template v-else>
                  Remove <span class="font-medium text-gray-700">{{ deletingVideo?.title }}</span> from the playlist? This cannot be undone.
                </template>
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button @click="confirmDelete" :disabled="deleting"
              class="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import {
  PlusIcon,
  FilmIcon,
  PlayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  PaperAirplaneIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  QueueListIcon,
} from '@heroicons/vue/24/outline'
import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  sendVideoToTelegram,
  sendPlaylistToTelegram,
  extractYouTubeId,
  getYouTubeThumbnail,
  fetchYouTubeMeta,
} from '@/modules/shared/services/lessonService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'

const toast = useToast()

//  Playlists
const playlists        = ref([])
const playlistsLoading = ref(true)
const playlistSearch   = ref('')
const selectedPlaylist = ref(null)

const filteredPlaylists = computed(() => {
  if (!playlistSearch.value.trim()) return playlists.value
  const q = playlistSearch.value.toLowerCase()
  return playlists.value.filter(p => p.title?.toLowerCase().includes(q))
})

function syncPlaylistVideoCount(playlistId, count) {
  const idx = playlists.value.findIndex(p => p.id === playlistId)
  if (idx !== -1) {
    playlists.value[idx] = {
      ...playlists.value[idx],
      video_count: count,
    }
  }

  if (selectedPlaylist.value?.id === playlistId) {
    selectedPlaylist.value = {
      ...selectedPlaylist.value,
      video_count: count,
    }
  }
}

async function loadPlaylists() {
  playlistsLoading.value = true
  try {
    const res = await getPlaylists({ per_page: 100 })
    playlists.value = (res.data || []).map(p => ({
      ...p,
      video_count: p.videos?.length ?? p.video_count ?? 0,
    }))
  } catch {
    playlists.value = []
  } finally {
    playlistsLoading.value = false
  }
}

//  Videos
const videos        = ref([])
const videosLoading = ref(false)
const reordering    = ref(false)

function getVideoThumbnail(url) {
  const id = extractYouTubeId(url)
  return id ? getYouTubeThumbnail(id) : null
}

async function selectPlaylist(pl) {
  selectedPlaylist.value = pl
  videosLoading.value = true
  try {
    videos.value = await getVideos(pl.id)
    syncPlaylistVideoCount(pl.id, videos.value.length)
  } catch {
    videos.value = []
    syncPlaylistVideoCount(pl.id, 0)
  } finally {
    videosLoading.value = false
  }
}

async function moveVideo(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= videos.value.length) return
  reordering.value = true
  try {
    const reordered = [...videos.value]
    const [item] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, item)
    // assign new positions (1-based)
    const payload = reordered.map((v, i) => ({ id: v.id, position: i + 1 }))
    const result = await reorderVideos(selectedPlaylist.value.id, payload)
    videos.value = result
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to reorder.')
  } finally {
    reordering.value = false
  }
}

//  Create / Edit Playlist
const showPlaylistModal = ref(false)
const editingPlaylist   = ref(null)
const playlistSaving    = ref(false)
const playlistForm      = reactive({ title: '', description: '', is_public: false })

function openCreatePlaylist() {
  editingPlaylist.value = null
  Object.assign(playlistForm, { title: '', description: '', is_public: false })
  showPlaylistModal.value = true
}

function openEditPlaylist(pl) {
  editingPlaylist.value = pl
  Object.assign(playlistForm, { title: pl.title, description: pl.description || '', is_public: pl.is_public ?? false })
  showPlaylistModal.value = true
}

function closePlaylistModal() {
  showPlaylistModal.value = false
}

async function savePlaylist() {
  if (!playlistForm.title.trim()) return
  playlistSaving.value = true
  try {
    const payload = {
      title: playlistForm.title.trim(),
      description: playlistForm.description.trim() || null,
      is_public: playlistForm.is_public,
    }
    if (editingPlaylist.value) {
      const updated = await updatePlaylist(editingPlaylist.value.id, payload)
      const idx = playlists.value.findIndex(p => p.id === editingPlaylist.value.id)
      if (idx !== -1) playlists.value[idx] = { ...playlists.value[idx], ...updated }
      if (selectedPlaylist.value?.id === editingPlaylist.value.id) {
        selectedPlaylist.value = { ...selectedPlaylist.value, ...updated }
      }
      toast.success('Playlist updated.')
    } else {
      const created = await createPlaylist(payload)
      playlists.value.unshift({ ...created, video_count: 0 })
      toast.success('Playlist created.')
    }
    closePlaylistModal()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to save playlist.')
  } finally {
    playlistSaving.value = false
  }
}

//  Add / Edit Video
const showVideoModal  = ref(false)
const editingVideo    = ref(null)
const fetchingMeta    = ref(false)
const fetchError      = ref('')
const videoSaving     = ref(false)
const videoForm       = reactive({ youtube_url: '', title: '', description: '' })
const videoPreview    = reactive({ thumbnail: '', title: '', author: '' })

function openAddVideo() {
  editingVideo.value = null
  Object.assign(videoForm, { youtube_url: '', title: '', description: '' })
  Object.assign(videoPreview, { thumbnail: '', title: '', author: '' })
  fetchError.value = ''
  showVideoModal.value = true
}

function openEditVideo(video) {
  editingVideo.value = video
  Object.assign(videoForm, {
    youtube_url: video.youtube_url || '',
    title:       video.title || '',
    description: video.description || '',
  })
  const id = extractYouTubeId(video.youtube_url)
  Object.assign(videoPreview, {
    thumbnail: id ? getYouTubeThumbnail(id) : '',
    title:     video.title || '',
    author:    '',
  })
  fetchError.value = ''
  showVideoModal.value = true
}

function closeVideoModal() {
  showVideoModal.value = false
}

async function fetchMeta() {
  if (!videoForm.youtube_url.trim()) return
  fetchError.value = ''
  fetchingMeta.value = true
  try {
    const meta = await fetchYouTubeMeta(videoForm.youtube_url.trim())
    if (!editingVideo.value || !videoForm.title) videoForm.title = meta.title
    Object.assign(videoPreview, { thumbnail: meta.thumbnail, title: meta.title, author: meta.author })
  } catch (err) {
    fetchError.value = err.message || 'Could not fetch video info.'
  } finally {
    fetchingMeta.value = false
  }
}

async function saveVideo() {
  if (!videoForm.youtube_url || !videoForm.title.trim()) return
  videoSaving.value = true
  try {
    const payload = {
      youtube_url:  videoForm.youtube_url.trim(),
      title:        videoForm.title.trim(),
      description:  videoForm.description.trim() || null,
    }
    if (editingVideo.value) {
      const updated = await updateVideo(selectedPlaylist.value.id, editingVideo.value.id, payload)
      const idx = videos.value.findIndex(v => v.id === editingVideo.value.id)
      if (idx !== -1) videos.value[idx] = updated
      toast.success('Video updated.')
    } else {
      const created = await addVideo(selectedPlaylist.value.id, payload)
      videos.value.push(created)
      syncPlaylistVideoCount(selectedPlaylist.value.id, videos.value.length)
      toast.success('Video added.')
    }
    closeVideoModal()
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.response?.data?.errors?.youtube_url?.[0] || 'Failed to save video.')
  } finally {
    videoSaving.value = false
  }
}

//  Send to Telegram
const showSendModal = ref(false)
const sendTarget    = ref('playlist')   // 'playlist' | 'video'
const sendingVideo  = ref(null)
const sending       = ref(false)
const sendForm      = reactive({ chat_id: '', message: '' })

function openSendPlaylist() {
  sendTarget.value = 'playlist'
  sendingVideo.value = null
  Object.assign(sendForm, { chat_id: '', message: '' })
  showSendModal.value = true
}

function openSendVideo(video) {
  sendTarget.value = 'video'
  sendingVideo.value = video
  Object.assign(sendForm, { chat_id: '', message: '' })
  showSendModal.value = true
}

function closeSendModal() {
  showSendModal.value = false
}

async function confirmSend() {
  if (!sendForm.chat_id.trim()) return
  sending.value = true
  try {
    const payload = {
      chat_id: sendForm.chat_id.trim(),
      ...(sendForm.message.trim() ? { message: sendForm.message.trim() } : {}),
    }
    if (sendTarget.value === 'playlist') {
      await sendPlaylistToTelegram(selectedPlaylist.value.id, payload)
      toast.success('Playlist queued for Telegram delivery.')
    } else {
      await sendVideoToTelegram(selectedPlaylist.value.id, sendingVideo.value.id, payload)
      toast.success('Video queued for Telegram delivery.')
    }
    closeSendModal()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to queue for Telegram.')
  } finally {
    sending.value = false
  }
}

//  Delete
const showDeleteModal  = ref(false)
const deleteTarget     = ref('video')   // 'playlist' | 'video'
const deletingPlaylist = ref(null)
const deletingVideo    = ref(null)
const deleting         = ref(false)

function promptDeletePlaylist(pl) {
  deleteTarget.value = 'playlist'
  deletingPlaylist.value = pl
  showDeleteModal.value = true
}

function promptDeleteVideo(video) {
  deleteTarget.value = 'video'
  deletingVideo.value = video
  showDeleteModal.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    if (deleteTarget.value === 'playlist') {
      await deletePlaylist(deletingPlaylist.value.id)
      playlists.value = playlists.value.filter(p => p.id !== deletingPlaylist.value.id)
      if (selectedPlaylist.value?.id === deletingPlaylist.value.id) {
        selectedPlaylist.value = null
        videos.value = []
      }
      toast.success('Playlist deleted.')
    } else {
      await deleteVideo(selectedPlaylist.value.id, deletingVideo.value.id)
      videos.value = videos.value.filter(v => v.id !== deletingVideo.value.id)
      syncPlaylistVideoCount(selectedPlaylist.value.id, videos.value.length)
      toast.success('Video removed.')
    }
    showDeleteModal.value = false
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to delete.')
  } finally {
    deleting.value = false
  }
}

//  Init
onMounted(loadPlaylists)
</script>
