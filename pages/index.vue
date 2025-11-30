<template>
  <div class="flex bg-zinc-900 h-screen">
    <div class="bg-black w-[316px] p-6 flex flex-col overflow-scroll">
      <div>
        <Logo />
      </div>

      <div>
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Today</p>
        <div class="m-3 space-y-2">
          <div
            v-for="note in todayNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 50) }}
            </h3>
            <div class="leading-none text-[#D6D6D6] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updatedAt).toLocaleDateString() }}
              </span>
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]"
                >...
                {{ note.text.substring(50, 100) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Yesterday</p>
        <div class="m-3 space-y-2">
          <div
            v-for="note in yesterdayNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 50) }}
            </h3>
            <div class="leading-none text-white truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updatedAt).toLocaleDateString() }}
              </span>
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]">
                {{ note.text.substring(50, 100) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Earlier</p>
        <div class="m-3 space-y-2">
          <div
            v-for="note in earlierNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 50) }}
            </h3>
            <div class="leading-none text-white truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updatedAt).toLocaleDateString() }}
              </span>
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]">
                {{ note.text.substring(50, 100) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col">
      <div class="flex justify-between w-full items-start p-6">
        <button
          class="inline-flex items-center text-xs text-[#C2C2C5] hover:text-white font-bold space-x-2"
          @click="createNewNote"
        >
          <IconPencil />
          <span>Create Note</span>
        </button>
      </div>

      <div class="max-w-[437px] mx-auto w-full flex flex-col flex-grow">
        <p class="text-[#929292] font-playfair">
          {{ new Date(selectedNote.updatedAt).toLocaleDateString() }}
        </p>
        <textarea
          ref="textarea"
          v-model="updatedNote"
          class="text-[#D4D4D4] my-4 font-playfair w-full bg-transparent focus:outline-none flex-grow"
          name="note"
          id="note"
          @input="
            () => {
              debouncedFn();
              selectedNote.text = updatedNote;
            }
          "
        ></textarea>
      </div>
      <button
        class="text-zinc-400 hover:text-white text-sm font-bold absolute right-0 bottom-0 p-8"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
const updatedNote = ref("");
const notes = ref([]);
const selectedNote = ref({});
const textarea = ref(null);

definePageMeta({
  middleware: ["auth"],
});

function setNote(note) {
  selectedNote.value = note;
  updatedNote.value = note.text;
}

function logout() {
  const jwtToken = useCookie("JWTtoken");
  jwtToken.value = null;
  navigateTo("/login");
}

async function createNewNote() {
  try {
    const newNote = await $fetch("/api/notes", {
      method: "POST",
    });

    notes.value.unshift(newNote);
    selectedNote.value = notes.value[0];
    updatedNote.value = "";
    textarea.value.focus();
  } catch (error) {
    console.error("Error creating note:", error);
  }
}

const debouncedFn = useDebounceFn(async () => {
  await updateNote();
}, 1000);

async function updateNote() {
  try {
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: "PATCH",
      body: {
        updatedNote: updatedNote.value,
      },
    });
  } catch (error) {
    console.error("Error updating note:", error);
  }
}

const todayNotes = computed(() => {
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updatedAt);
    return noteDate.toDateString() === new Date().toDateString();
  });
});

const yesterdayNotes = computed(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return notes.value.filter((note) => {
    const noteDate = new Date(note.updatedAt);
    return noteDate.toDateString() === yesterday.toDateString();
  });
});

const earlierNotes = computed(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return notes.value.filter((note) => {
    const noteDate = new Date(note.updatedAt);
    return (
      noteDate < yesterday &&
      noteDate.toDateString() !== yesterday.toDateString()
    );
  });
});

onMounted(async () => {
  notes.value = await $fetch("/api/notes");

  notes.value.sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (notes.value.length > 0) selectedNote.value = notes.value[0];
  else {
    await createNewNote();
    selectedNote.value = notes.value[0];
  }

  updatedNote.value = selectedNote.value.text;
  textarea.value.focus();
});
</script>
