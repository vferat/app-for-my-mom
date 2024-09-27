<template>
  <div class="container mt-2">
    <!-- Words to find -->
    <div class="row mb-4">
      <h4>Words to Find:</h4>
      <div class="col">
        <div v-for="(word, index) in wordsToFind" :key="index">
          <span v-if="foundWords.includes(word)" class="found-word">{{ word }}</span>
          <span v-else>{{ '*'.repeat(word.length) }}</span>
        </div>
      </div>
    </div>

    <!-- First row: display letters in the order they were clicked or '-' if not selected -->
    <div class="btn-group" role="group" aria-label="Basic example">
      <div v-for="(letter, index) in displayLetters" :key="index" class="col">
        <button 
          type="button" 
          class="btn btn-secondary btn-custom" 
          :class="{ 'btn-success': letter.disabled }" 
          disabled>
          {{ letter.letter || '-' }}
        </button>
      </div>
    </div>

    <!-- Circle buttons -->
    <div class="circle-container mt-5">
      <button
        v-for="letter in letters"
        :key="letter.id"
        type="button"
        class="btn btn-secondary circle-button"
        :disabled="letter.disabled"
        :style="{ top: `${letter.y}px`, left: `${letter.x}px` }"
        @click="addLetter(letter)"
      >
        {{ letter.letter }}
      </button>
    </div>

    <!-- Button to erase the last letter -->
    <div class="row mt-3">
      <div class="col text-center">
        <button type="button" class="btn btn-danger" @click="removeLastLetter">
          Erase Last Letter
        </button>
      </div>
    </div>

    <!-- Button to check the word -->
    <div class="row mt-3">
      <div class="col text-center">
        <button type="button" class="btn btn-primary" @click="checkWord">
          Check Word
        </button>
      </div>
    </div>

    <!-- Display score -->
    <div class="row mt-3">
      <div class="col text-center">
        <h5>Score: {{ bonusPoints }}</h5>
      </div>
    </div>

    <!-- Result of the word check -->
    <div v-if="checkResult !== null" class="mt-3 text-center">
      <p v-if="checkResult">The word "{{ formedWord }}" exists in the dictionary.</p>
      <p v-else>The word "{{ formedWord }}" does not exist in the dictionary.</p>
    </div>
  </div>
</template>

<script>
import words from '../assets/words.json'
import lemmes from '../assets/lemmes.json'

export default {
  name: 'Game',
  data() {
    return {
      letters: [],
      checkResult: null,
      formedWord: "",
      dictionary: [],
      lemmes: [],
      wordsToFind: [],
      foundWords: [],
      bonusPoints: 0,
      nLetters: 7,  // Add this for use in mounted and displayLetters
    };
  },

  computed: {
    displayLetters() {
      const displayArray = Array(this.nLetters).fill({ letter: null, disabled: true, selection_order: null });
      this.letters.forEach(letter => {
        if (letter.selection_order !== null) {
          displayArray[letter.selection_order] = {
            letter: letter.letter,
            disabled: true,
            selection_order: letter.selection_order
          };
        }
      });
      return displayArray;
    }
  },

  methods: {
    addLetter(letter) {
      letter.selection_order = this.letters.filter(l => l.selection_order !== null).length;
      letter.disabled = true;
    },
    removeLastLetter() {
      const selectedLetters = this.letters.filter(l => l.selection_order !== null);
      if (selectedLetters.length > 0) {
        const lastSelected = selectedLetters.reduce((prev, curr) =>
          (prev.selection_order > curr.selection_order ? prev : curr)
        );
        lastSelected.selection_order = null;
        lastSelected.disabled = false;
      } else {
        console.log("No letters have been selected yet.");
      }
    },
    checkWord() {
      this.formedWord = this.letters
        .filter(letter => letter.selection_order !== null)
        .sort((a, b) => a.selection_order - b.selection_order)
        .map(letter => letter.letter)
        .join('');

      const wordExists = this.dictionary.includes(this.formedWord);
      this.checkResult = wordExists;

      if (this.wordsToFind.includes(this.formedWord)) {
        this.foundWords.push(this.formedWord);
      }

      if (wordExists) {
        this.bonusPoints += 1;
      }

      this.resetSelection();
    },
    resetSelection() {
      this.letters.forEach(letter => {
        letter.selection_order = null;
        letter.disabled = false;
      });
    },
    canFormWord(word, letterList) {
      let availableLetters = [...letterList];
      for (let letter of word) {
        let index = availableLetters.indexOf(letter);
        if (index === -1) {
          return false;
        }
        availableLetters.splice(index, 1);
      }
      return true;
    },
    findAllLemmes() {
      const letterList = this.letters.map(letter => letter.letter); // Changed to array
      return this.lemmes.filter(word => this.canFormWord(word, letterList));
    },
  },

  mounted() {
    this.dictionary = words;
    this.lemmes = lemmes;

    const nWord2Find = 5;

    // Get a random word from the lemmes with a length matching nLetters
    const nCharWords = this.lemmes.filter(word => word.length === this.nLetters);
    const randomWord = nCharWords[Math.floor(Math.random() * nCharWords.length)];

    const letters = randomWord.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    const angleStep = (2 * Math.PI) / this.nLetters;
    const radius = 100;

    for (let i = 0; i < this.nLetters; i++) {
      const letter = letters[i];
      const angle = i * angleStep;
      const x = radius + radius * Math.cos(angle) - 25;
      const y = radius + radius * Math.sin(angle) - 25;
      this.letters.push({ id: i + 1, letter: letter, disabled: false, selection_order: null, x: x, y: y });
    }

    let validWords = this.findAllLemmes();
    if (validWords.length < nWord2Find) {
      console.log("Not enough words to find.");
      return;
    }

    for (let i = validWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validWords[i], validWords[j]] = [validWords[j], validWords[i]];
    }

    this.wordsToFind = validWords.slice(0, nWord2Find);
  }
};
</script>

<style scoped>
.circle-container {
  position: relative;
  width: 300px;
  height: 300px;
  border: 2px solid #4b1100;
  border-radius: 50%;
  margin: 0 auto;
}

.circle-button {
  position: absolute;
  width: 50px;
  height: 50px;
  transform: translate(100%, 100%);
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50%;
}

.btn-custom {
  width: 60px;
  height: 60px;
  padding: 10px;
  border-radius: 10%;
}


.btn-success {
  background-color: #28a745 !important; /* Green color */
  color: white !important; /* White text */
}

.btn-danger {
  width: 100%; /* Full width for the erase button */
  height: 50px; /* Fixed height for the erase button */
}

.found-word {
  color: green; /* Color for found words */
  font-weight: bold;
}

.hidden-word {
  color: gray; /* Color for hidden words */
}
</style>