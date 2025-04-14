const daySelect = document.getElementById('daySelect');
const timeSlotSelect = document.getElementById('timeSlotSelect');
const ctx = document.getElementById('ratingsChart').getContext('2d');
let chart;

async function fetchAndDrawChart() {
  const day = daySelect.value;
  const time = timeSlotSelect.value;

  const res = await fetch('/api/meals');
  const meals = await res.json();

  const labels = [];
  const ratings = [];

  meals.forEach(meal => {
    const slot = meal.ratingsByDay?.[day]?.[time];
    if (slot && slot.count > 0) {
      labels.push(meal.name);
      ratings.push(slot.average.toFixed(1));
    }
  });

  if (chart) chart.destroy(); // Replace old chart

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `${day} - ${time} Avg Ratings`,
        data: ratings,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 5 }
      }
    }
  });
}

daySelect.addEventListener('change', fetchAndDrawChart);
timeSlotSelect.addEventListener('change', fetchAndDrawChart);

// Initial load
fetchAndDrawChart();
