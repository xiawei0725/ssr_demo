<template>
  <div id="app">
    <h1>this is app vue</h1>
    <button @click="inc">{{ count }}</button>
    <router-link to="/">home</router-link>
    <router-link to="/about">about</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 1,
    };
  },
  methods:{
    inc(){
      this.count++
    }
  }
};
</script>

<style>
</style>