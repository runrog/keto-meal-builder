/* global $ dragula */
/* eslint no-console: 0 */
/* eslint no-param-reassign: ["error", { "props": false }] */

const keto = {
  user: {
    day: {
      goal: {
        protein: 0,
        carbs: 0,
        fats: 0,
      },
      breakfast: {
        protein: 0,
        carbs: 0,
        fats: 0,
      },
      lunch: {
        protein: 0,
        carbs: 0,
        fats: 0,
      },
      dinner: {
        protein: 0,
        carbs: 0,
        fats: 0,
      },
    },
  },
  getFoods() {
    $.getJSON('./keto.json')
      .done(data => this.makeCategories(data.foods))
      .fail(() => console.log('There was an issue getting foods'));
  },
  renderBuildTotals() {
    // round by Math.round(num * 100) / 100
    const $day = $('.food-per-day');
    const breakfast = {
      el: $day.find('.plate-breakfast-totals'),
      stats: this.user.day.breakfast,
    };
    breakfast.el.html(
      `Proteins: <b class="protein-color">${breakfast.stats.protein}</b> 
      Carbs: <b class="carbs-color">${breakfast.stats.carbs}</b>  
      Fats: <b class="fats-color">${breakfast.stats.fats}</b>`);
    const lunch = {
      el: $day.find('.plate-lunch-totals'),
      stats: this.user.day.lunch,
    };
    lunch.el.html(
      `Proteins: <b class="protein-color">${lunch.stats.protein}</b>  
      Carbs: <b class="carbs-color">${lunch.stats.carbs}</b>  
      Fats: <b class="fats-color">${lunch.stats.fats}</b>`);
    const dinner = {
      el: $day.find('.plate-dinner-totals'),
      stats: this.user.day.dinner,
    };
    dinner.el.html(
      `Proteins: <b class="protein-color">${dinner.stats.protein}</b>  
      Carbs: <b class="carbs-color">${dinner.stats.carbs}</b> 
      Fats: <b class="fats-color">${dinner.stats.fats}</b>`);
    // add totals
    $('.food-day-total').html(`
      Protein: <b class="protein-color">${breakfast.stats.protein + lunch.stats.protein + dinner.stats.protein}</b>  
      Carbs: <b class="carbs-color">${breakfast.stats.carbs + lunch.stats.carbs + dinner.stats.carbs}</b> 
      Fats: <b class="fats-color">${breakfast.stats.fats + lunch.stats.fats + dinner.stats.fats}</b>`);
  },
  drake: dragula({
    copy: true,
    accepts(el, target) {
      return $(target).hasClass('plate-breakfast') ||
      $(target).hasClass('plate-lunch') ||
      $(target).hasClass('plate-dinner');
    },
    moves(el, source) {
      return !$(source).hasClass('plate-breakfast') &&
      !$(source).hasClass('plate-lunch') &&
      !$(source).hasClass('plate-dinner');
    },
  }),
  addDrakeEvents() {
    return this.drake
      .on('drop', (el, target) => {
        if ($(target).hasClass('plate-breakfast') ||
            $(target).hasClass('plate-lunch') ||
            $(target).hasClass('plate-dinner')) {
          const item = JSON.parse($(el).attr('data-facts'));
          this.addToPlate(item, target);
          $(el).find('.food-item-remove')
               .on('click', this.removeFromPlate);
        }
      });
  },
  addToPlate(item, target) {
    const meal = $(target).attr('data-meal');
    this.user.day[meal].protein += item.protein;
    this.user.day[meal].carbs += item.carbs;
    this.user.day[meal].fats += item.fats;
    this.renderBuildTotals();
  },
  removeFromPlate(e) {
    e.preventDefault();
    const $el = $(e.currentTarget);
    const $item = $el.parent();
    const facts = JSON.parse($item.attr('data-facts'));
    const meal = $item.parent().attr('data-meal');
    keto.user.day[meal].protein -= facts.protein;
    keto.user.day[meal].carbs -= facts.carbs;
    keto.user.day[meal].fats -= facts.fats;
    keto.renderBuildTotals();
    $item.remove();
  },
  makeContainers() {
    this.drake.containers.push(
      $('.plate-breakfast').get(0),
      $('.plate-lunch').get(0),
      $('.plate-dinner').get(0),
      $('.food-pallet-meat').get(0),
      $('.food-pallet-dairy').get(0),
      $('.food-pallet-oils').get(0),
      $('.food-pallet-fruit').get(0),
      $('.food-pallet-vegetable').get(0),
    );
    this.addDrakeEvents();
  },
  makeCategories(foods) {
    const $fp = $('#food-pallet');
    foods.forEach((item) => {
      $fp.find(`.food-pallet-${item.type}`).append(
        `<div class="food-pallet-item drag-item" data-facts='${JSON.stringify(item)}'>
          <a href="#" class="food-item-remove">x</a>
          <span class="food-item-name">${item.food}</span>
          <span class="food-item-protein">${item.protein}, </span>
          <span class="food-item-carbs">${item.carbs}, </span>
          <span class="food-item-fats">${item.fats}</span>
        </div>`);
    });
    this.makeContainers();
  },
  init() {
    this.getFoods();
  },
};

keto.init();
