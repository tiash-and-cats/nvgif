// Navigation
function openNav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "") {
    x.className = "responsive";
  } else {
    x.className = "";
  }
}

// Table of Contents
function buildTOCGraph(level, i, headings) {
  const g = { heading: headings[i].innerHTML, id: headings[i].id, childHeadings: [] };
  let j = i + 1;
  while (j < headings.length) {
    const e = headings[j];
    const eLevel = parseInt(e.tagName.replace("H",""));
    if (eLevel <= level) break; // stop when same or higher level
    g.childHeadings.push(buildTOCGraph(eLevel, j, headings));
    // skip past the subtree we just consumed
    while (j+1 < headings.length && parseInt(headings[j+1].tagName.replace("H","")) > eLevel) {
      j++;
    }
    j++;
  }
  return g;
}

function buildTOCView(g, e) {
  if (g.childHeadings.length === 0) {
    const a = document.createElement("a");
    a.href = `#${g.id}`;
    a.innerHTML = g.heading;
    e.appendChild(a);
  } else {
    const btn = document.createElement("button");
    btn.className = "dropdown-btn active";
    const a = document.createElement("a");
    a.href = `#${g.id}`;
    a.innerHTML = g.heading;
    btn.appendChild(a);
    const i = document.createElement("i");
    i.className = "fa fa-caret-down";
    btn.appendChild(i);
    e.appendChild(btn);
    const drp = document.createElement("div");
    drp.className = "dropdown-container";
	drp.style.display = "block";
    for (let subG of g.childHeadings) {
      buildTOCView(subG, drp);
    }
    e.appendChild(drp);
  }
}

const headings = document.querySelectorAll("article :is(h1, h2, h3, h4, h5, h6)");

if (!globalThis._SPHINX) { /* the Sphinx layout both sets this variable and 
                              populates the TOC; see implementation/_themes/
                              nvgif/layout.html and implementation/_themes/
                              nvgif/localtoc.html. */
  const toc = buildTOCGraph(1, 0, headings);
  buildTOCView(toc, document.querySelector(".sidenav"));
}

var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].tabindex = -1;
  dropdown[i].addEventListener("click", function(e) {
    if (e.target.tagName === "A") return;
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
  dropdown[i].addEventListener("keydown", function(e) {
    if (e.target.tagName !== "A") return;
    if (e.key === " ") {
      e.preventDefault();
      this.click();
    }
  });
}

// Permalinks
headings.forEach(e => {
  const a = document.createElement("a");
  a.innerText = "#";
  a.href = `#${e.id}`;
  a.className = "permalink";
  e.innerHTML += " "
  e.appendChild(a);
  e.tabindex = -1;
});

// Funny quotes!
const quotes = [
  "You didn't need efficiency, the efficiency was inside you all along.",
  "Perhaps the best image format was the friends we made along the way."
];
document.getElementById("quote").textContent = quotes[Math.floor(Math.random() * quotes.length)];
document.getElementById("year").textContent = new Date().getFullYear();