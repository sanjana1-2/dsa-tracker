const fs = require('fs');

const htmlContent = fs.readFileSync('C:/Users/Sanjana/Desktop/dsa-patterns-300.html', 'utf-8');

// Extract the DATA array using regex or eval
const match = htmlContent.match(/const DATA = (\[[\s\S]*?\]);\n/);
if (match) {
  let dataStr = match[1];
  // To evaluate safely, we can prepend a variable assignment
  const DATA = eval(dataStr);
  
  let newQuestions = [];
  let dayCounter = 91; // Start from day 91 for the new questions
  let qPerDay = 0;
  
  DATA.forEach((patternObj) => {
    patternObj.q.forEach(qArr => {
      // qArr: ["Two Sum", "two-sum", "E", 1, "Amazon,Google,Apple,Adobe,Bloomberg"]
      const title = qArr[0];
      const link = `https://leetcode.com/problems/${qArr[1]}/`;
      let difficulty = 'Easy';
      if (qArr[2] === 'M') difficulty = 'Medium';
      if (qArr[2] === 'H') difficulty = 'Hard';
      
      const topic = patternObj.p;
      
      newQuestions.push({
        day: dayCounter,
        title: title,
        topic: topic,
        difficulty: difficulty,
        link: link,
        month: 4 // Put them in month 4
      });
      
      qPerDay++;
      if (qPerDay >= 7) {
        dayCounter++;
        qPerDay = 0;
      }
    });
  });
  
  // Read existing seedData.js
  let seedDataContent = fs.readFileSync('C:/Users/Sanjana/Desktop/3monthsa/server/data/seedData.js', 'utf-8');
  
  // Find the end of the array
  const lastIndex = seedDataContent.lastIndexOf('];');
  
  if (lastIndex !== -1) {
    let newItemsStr = newQuestions.map(q => {
      return `  { day: ${q.day}, title: '${q.title.replace(/'/g, "\\'")}', topic: '${q.topic.replace(/'/g, "\\'")}', difficulty: '${q.difficulty}', link: '${q.link}', month: ${q.month} },`;
    }).join('\n');
    
    let updatedContent = seedDataContent.substring(0, lastIndex) + '\n  // --- Bonus Questions (From dsa-patterns-300.html) ---\n' + newItemsStr + '\n' + seedDataContent.substring(lastIndex);
    
    fs.writeFileSync('C:/Users/Sanjana/Desktop/3monthsa/server/data/seedData.js', updatedContent, 'utf-8');
    console.log(`Appended ${newQuestions.length} questions successfully!`);
  } else {
    console.log("Could not find the end of the seedQuestions array.");
  }
} else {
  console.log("Could not extract DATA array from HTML.");
}
