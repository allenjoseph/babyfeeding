<script lang="ts">
  import { signInWithGoogle } from '$lib/services/auth';
</script>

<div class="flex items-center justify-center py-12">
  <button
    class="waves waves-primary btn btn-outline btn-primary"
    onclick={() => signInWithGoogle()}
  >
    <img
      src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/brand-logo/google-icon.png"
      alt="google icon"
      class="size-5 object-cover"
    />
    Sign in with google
  </button>
</div>
