<template>
  <div>
    <h1>this is app vue</h1>
    <button @click="count++">{{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 1,
    };
  },
};
</script>

<style>
</style>