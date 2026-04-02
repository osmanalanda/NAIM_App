# 🥗 NAIM Diet Planner

![Naim Süleymanoğlu — Cep Herkülü](assets/naim.jpeg)

```
  ______  _    _  _____  ___   _____  ______  
 / _____|| |  | |/ ____||   | |  _  ||   _  | 
| |  ____| |  | || |    |   | | |_| ||  |_| | 
| | |_   | |  | || |    |---| |  ___||   ___/ 
| |__| | | |__| || |___ |   | | |    |  |     
 \_____|  \____/  \____||   |_||_|    |__|    

  N · A · I · M  —  Network-Free Automated Iterative Meals
```

> *"Her iterasyon daha iyi bir sen."*  
> Every iteration is a better you.

---

## What is NAIM Diet?

**NAIM Diet** is a personalized, offline-first diet generation app built on React Native. It adheres to the GNU Free Software philosophy: maximum privacy, no tracking, and 100% local operation using `AsyncStorage`. No accounts, no clouds, just you and your device. 

The app generates a full 7-day, 3-meals/day diet plan based on your physical goals and dietary preferences (e.g., Vegan, Vegetarian, Omnivore). 

---

## 🔄 The "Evolve" Loop (Iterative Dieting)

The core feature of NAIM is the **Evolution Loop**:
1. **Plan:** You receive a 7-day diet mapped exactly to your macro and calorie needs.
2. **Rate:** You rate meals out of 5 stars based on how much you liked them.
3. **Evolve:** Click **"Evolve to Iteration"** at the end of the week. NAIM analyzes your feedback, identifies any meals you rated poorly (2 stars or lower), replaces them with better alternatives, and generates your next week's plan (Iteration X+1).
4. **Log:** Your past weeks' stats are saved securely in your Iteration Log in the Profile tab.

A constantly adapting, privacy-respecting dieting engine.

---

## Tech Stack & Philosophy

| Feature | Description |
|---|---|
| **Local-First** | Uses device `AsyncStorage`. Your health data never leaves your phone. |
| **Philosophy** | GNU Free Software alignment. Total data ownership. |
| **UI** | Glassmorphism, smooth animations, and dark-theme elegance. |
| **Engine** | React Native + custom offline meal-generation engine. |

### Quick Start

```bash
cd GucApp
npm install
npx expo start
```
*Built iteratively, adapting to you.*
