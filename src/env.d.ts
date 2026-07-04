/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: {
      userId: number;
      username: string;
      nama: string;
    };
  }
}
