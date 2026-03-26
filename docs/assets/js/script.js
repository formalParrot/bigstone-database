let projectsData = [];

async function init() {
  try {
    const response = await fetch(
      "https://bigstone-api.justparrot.workers.dev/projects/",
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    projectsData = await response.json();
    console.log(projectsData);

    loadProjects();

    initFloatingIcons();
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

const fallbackGif = "/assets/assets/img_fallback.gif";

function loadProjects() {
  const grid = document.querySelector("#grid");
  grid.innerHTML = "";

  projectsData.forEach(function (project) {
    const card = document.createElement("div");
    card.className = "card uk-card uk-card-default";
    card.dataset.name = project.name.toLowerCase();

    const imgPath = project.banner_url || fallbackGif;
    const downloadUrl = `https://bigstone-api.justparrot.workers.dev/projects/${project.id}/download`;

    card.addEventListener("click", function () {
      openModal(
        project.name,
        project.desc,
        project.owner_id,
        imgPath,
        downloadUrl,
      );
    });

    const words = project.desc.split(" ");
    const snippet = words.slice(0, 5).join(" ") + "...";

    card.innerHTML = `
    <img src="${imgPath}" alt="${project.name}" onerror="this.onerror=null; this.src='${fallbackGif}';" />
    <h3 class="uk-card-title">${project.name}</h3>
    <p>${snippet}</p>
    `;

    grid.appendChild(card);
  });
}

async function openModal(title, description, ownerId, imageUrl, downloadLink) {
  document.querySelector("#m-title").textContent = title;
  document.querySelector("#m-desc").textContent = description;

  const modalImg = document.querySelector("#m-img");
  modalImg.src = imageUrl;
  modalImg.onerror = function () {
    this.onerror = null;
    this.src = fallbackGif;
  };

  document.querySelector("#m-download").href = downloadLink;

  const tagsContainer = document.querySelector("#m-tags");

  // temp. placeholder
  tagsContainer.innerHTML = `<span class="tag">Loading...</span>`;

  try {
    const res = await fetch(
      `https://bigstone-api.justparrot.workers.dev/users/${ownerId}`,
    );
    const user = await res.json();

    tagsContainer.innerHTML = `
            <span class="tag">${user.username}</span>
        `;
  } catch (err) {
    tagsContainer.innerHTML = `<span class="tag">Unknown</span>`;
    console.error(err);
  }

  UIkit.modal(document.querySelector("#compModal")).show();
}

// Search blocks
function searchItems() {
  const searchTerm = document.querySelector("#search").value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const componentName = card.dataset.name;

    if (componentName.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Create flying blocks
function initFloatingIcons() {
  const wrapper = document.querySelector("#particles");
  const header = document.querySelector("#mainHeader");

  const images = projectsData.map((p) => p.banner_url).filter(Boolean);

  if (images.length === 0) {
    images.push("img_fallback.gif");
  }

  for (let i = 0; i < 12; i++) {
    const iconEl = document.createElement("img");

    const randomImage = images[Math.floor(Math.random() * images.length)];

    iconEl.src = randomImage;
    iconEl.className = "floating-comp";

    let posX = Math.random() * window.innerWidth;
    let posY = Math.random() * header.offsetHeight;
    let speedX = (Math.random() - 0.5) * 1.4;
    let speedY = (Math.random() - 0.5) * 1.4;
    let rotationDeg = Math.random() * 360;
    let rotationSpeed = (Math.random() - 0.5) * 1.8;

    function animateIcon() {
      posX += speedX;
      posY += speedY;
      rotationDeg += rotationSpeed;

      if (posX > window.innerWidth + 50) posX = -50;
      if (posX < -50) posX = window.innerWidth + 50;
      if (posY > header.offsetHeight + 50) posY = -50;
      if (posY < -50) posY = header.offsetHeight + 50;

      iconEl.style.left = posX + "px";
      iconEl.style.top = posY + "px";
      iconEl.style.transform = `rotate(${rotationDeg}deg)`;

      requestAnimationFrame(animateIcon);
    }

    wrapper.appendChild(iconEl);
    animateIcon();
  }
}

// starts the obecxts
window.addEventListener("load", function () {
  init();
});
