<template>
  <div class="container-fluid mt-2">
    <!-- Words to find -->
    <div class="row mb-2">
      <h4>Mots à trouver:</h4>
      <div class="col">
        <div v-for="(word, index) in wordsToFind" :key="index">
          <div v-for="letter in word" :key="letter" class="d-inline-block">
            <button class="btn btn-secondary btn-hiddenword found-word" v-if="foundWords.includes(word)" disabled>{{ letter }}</button>
            <button class="btn btn-secondary btn-hiddenword found-word" v-else disabled> - </button>
          </div>
        </div>
      </div>
    </div>

    <!-- First row: display letters in the order they were clicked or '-' if not selected -->
    <div class="btn-group" role="group" aria-label="Basic example">
      <div v-for="(letter, index) in displayLetters" :key="index" class="col">
        <button 
          type="button" 
          class="btn btn-secondary btn-custom uppercase-text" 
          :class="{ 'btn-currentword': letter.disabled }" 
          disabled>
          {{ letter.letter || '-' }}
        </button>
      </div>
    </div>

    <!-- Result of the word check -->
    <div v-if="checkResult !== null" class="mt-3 text-center">
      <p v-if="checkResult">Le mot "{{ formedWord }}" existe.</p>
      <p v-else>Le mot "{{ formedWord }}" n'existe pas.</p>
    </div>


    <!-- Circle buttons -->
    <div class="circle-container mt-5 mb-5">
      <button
        v-for="letter in letters"
        :key="letter.id"
        type="button"
        class="btn btn-secondary circle-button uppercase-text"
        :disabled="letter.disabled"
        :style="{ top: `${letter.y}px`, left: `${letter.x}px` }"
        @click="addLetter(letter)"
      >
        {{ letter.letter || '-' }}
      </button>

      <!-- Display score -->
      <div class="text-center bonus">
        <h5>{{ bonusPoints }}</h5>
      </div>
    </div>

    <!-- Button to erase the last letter -->
    <div class="row mt-3">
      <div class="col align-self-end">
        <button type="button" class="btn btn-danger btn-lg" @click="removeLastLetter">
          Effacer
        </button>
      </div>
      <div class="col align-self-end">
        <button type="button" class="btn btn-primary btn-lg" @click="checkWord">
          Valider
        </button>
      </div>
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
      checkResult: false,
      formedWord: "",
      dictionary: [],
      lemmes: [],
      wordsToFind: [],
      foundWords: [],
      checkedWords: [],
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
        if (this.checkedWords.includes(this.formedWord)) {
          console.log("Word already found.");
        }
        else {
          this.bonusPoints += 1;
          this.checkedWords.push(this.formedWord);
        }
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
    startGame() {
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
      const radius = 125;

      for (let i = 0; i < this.nLetters; i++) {
        const letter = letters[i];
        const angle = i * angleStep;
        const x = radius + radius * Math.cos(angle);
        const y = radius + radius * Math.sin(angle);
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
      this.wordsToFind.push(randomWord);
      console.log(this.wordsToFind);
    }
  },

  mounted() {
    this.startGame();
  }
};
</script>

<style scoped>
.circle-container {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  margin: 0 auto;
}

.circle-button {
  position: absolute;
  width: 75px;
  height: 75px;
  transform: translate(0%, 0%);
  padding: 10px;
  background-color: #CCB7AE; /* Warm brown for active buttons */
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 150%;
}

.btn-custom {
  width: 60px;
  height: 60px;
  padding: 10px;
  border-radius: 20%;
  font-size: 150%;
  background-color: #706677; /* Lighter grayish-purple for inactive buttons */
  color: white;
  border: 2px solid #565264; /* Deep grayish-purple border */
  border-color:  #706677;
}

.btn-hiddenword {
  width: 60px;
  height: 60px;
  padding: 10px;
  border-radius: 0%;
  font-size: 150%;
  background-color: #CCB7AE !important;  /* Lighter grayish-purple for word buttons */
  color: white;
  border: 2px solid #565264; /* Deep grayish-purple border */
}

.bonus {
  position: absolute;
  transform: translate(0%, 0%);
  top: 150px;
  left: 50%;
  font-size: 150%;
  color: #565264; /* Deep grayish-purple for bonus points text */
}

.btn-currentword {
  background-color: #706677 !important; /* Green color for success */
  color: white !important;
}

.btn-primary {
  width: 60%;
  background-color: #CCB7AE !important; /* Warm brown for primary actions */
  border-color: #8d7e78;
  color: rgb(255, 255, 255);
}

.btn-danger {
  width: 60%;
  background-color: #A6808C !important; /* Deep grayish-purple for danger actions */
  border-color: #565264;
  color: white;
}

.found-word {
  color: #ffffff !important; /* Green color for found words */
  font-weight: bold;
}

.hidden-word {
  color: #706677; /* Grayish-purple for hidden words */
}

.uppercase-text {
  text-transform: uppercase;
  color: #706677; /* Lighter grayish-purple for text */
}

.container {
  background-color: #D6CFCB; /* Soft neutral background */
  padding: 20px;
  border-radius: 10px;
}
</style>
