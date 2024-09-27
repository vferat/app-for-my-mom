<template>
  <div class="container mt-5">
    <!-- Words to find -->
    <div class="row mb-4">
      <h4>Words to Find:</h4>
      <div class="col">
        <div v-for="(word, index) in wordsToFind" :key="index">
          <span v-if="foundWords.includes(word)" class="found-word">{{ word }}</span>
          <span v-else>{{ '*'.repeat(word.length) }}</span> <!-- Show asterisks matching the word length -->
        </div>
      </div>
    </div>

    <!-- First row: display letters in the order they were clicked or '-' if not selected -->
    <div class="row row-cols-5 gy-5">
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

    <!-- Second row: buttons with letters -->
    <div class="row row-cols-5 gx-1 mt-3">
      <div v-for="letter in letters" :key="letter.id" class="col">
        <button 
          type="button"
          class="btn btn-secondary btn-custom"
          :disabled="letter.disabled"
          @click="addLetter(letter)">
          {{ letter.letter }}
        </button>
      </div>
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
      letters: [
      ],
      checkResult: null, // To hold the result of the word check
      formedWord: "", // To hold the formed word
      dictionary: [], // valid words
      lemmes: [], // lemmes
      wordsToFind: [], // List of words to find
      foundWords: [], // Track words that have been found
      bonusPoints: 0 // Track bonus points
    };
  },
  computed: {
    displayLetters() {
      const displayArray = Array(5).fill({ letter: null, disabled: true, selection_order: null });
      
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
      // Construct the word from selected letters
      this.formedWord = this.letters
        .filter(letter => letter.selection_order !== null)
        .sort((a, b) => a.selection_order - b.selection_order)
        .map(letter => letter.letter)
        .join('');

      // Use the mock function to check if the word exists
      const wordExists = this.dictionary.includes(this.formedWord);
      this.checkResult = wordExists;

      // Check if the word is in the wordsToFind list
      if (this.wordsToFind.includes(this.formedWord)) {
        this.foundWords.push(this.formedWord); // Add the found word to the list
      }

      // Award points for valid words
      if (wordExists) {
        this.bonusPoints += 1; // Increment bonus points for valid words
      }

      // Reset selections
      this.resetSelection();
    },
    resetSelection() {
      this.letters.forEach(letter => {
        letter.selection_order = null; // Clear selection order
        letter.disabled = false; // Re-enable button
      });
    },
    canFormWord(word, letterList) {
      // Create a copy of letterList so we can modify it without changing the original
      let availableLetters = [...letterList];

      // Try to build the word letter by letter
      for (let letter of word) {
          let index = availableLetters.indexOf(letter);
          if (index === -1) {
              // Letter not available in the letterList
              return false;
          }
          // Remove the used letter from the available letters
          availableLetters.splice(index, 1);
      }

      // If we have successfully gone through all letters, the word can be formed
      return true;
    },
    findAllLemmes() {
        let letterList = this.letters.map(letter => letter.letter).join('');
        return this.lemmes.filter(word => this.canFormWord(word, letterList));
    }
  },
  mounted() {
    this.dictionary = words;
    this.lemmes = lemmes;
    const nLetters = 10;
    const nWord2Find = 5;

    const nCharWords =  this.lemmes.filter(word => word.length === nLetters);
    const randomWord = nCharWords[Math.floor(Math.random() * nCharWords.length)];
    console.log(randomWord);

    // Convert the word into an array of characters
    const letters = randomWord.split('');

    // Shuffle the array using Fisher-Yates shuffle algorithm
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];  // Swap
    }

    for (var i = 0; i < nLetters; i++) {
      var letter = letters[i];
      var d = { id: i+1, letter: letter, disabled: false, selection_order: null };
      this.letters.push(d);
    }

    let validWords = this.findAllLemmes();

    if (validWords.length < nWord2Find) {
      // Retry if there are not enough words to find
      console.log("Not enough words to find. Generating new words...");
      this.mounted();
      return;
    }
    else {
      // Shuffle the array using Fisher-Yates shuffle algorithm
      for (let i = validWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [validWords[i], validWords[j]] = [validWords[j], validWords[i]];  // Swap
      }
      // Select the first nWord2Find words
      this.wordsToFind = validWords.slice(0, nWord2Find);
      console.log(this.wordsToFind);
    }
  }
};
</script>

<style scoped>
.btn-custom {
  width: 50%;
  height: 100px; /* Fixed height for all buttons */
  display: flex;
  align-items: center;
  justify-content: center;
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