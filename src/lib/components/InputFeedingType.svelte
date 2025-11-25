<script lang="ts">
  let { group = $bindable() } = $props();
</script>

<div class="join">
  <input
    class="btn join-item w-24 btn-outline [--btn-color:#794dff]"
    type="radio"
    name="feeding-type"
    value="breastmilk"
    aria-label="Breastmilk"
    bind:group
  />
  <input
    class="btn join-item w-24 btn-outline [--btn-color:#794dff]"
    type="radio"
    name="feeding-type"
    value="formula"
    aria-label="Formula"
    bind:group
  />
  <input
    class="btn join-item w-24 btn-outline [--btn-color:#794dff]"
    type="radio"
    name="feeding-type"
    value="solid"
    aria-label="Solid"
    bind:group
  />
</div>
