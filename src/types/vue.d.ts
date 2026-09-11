export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    // 由全局 mixin（src/mixins/mixins.ts）通过 app.mixin 注入
    isMobile: boolean
    isPad: boolean
    isPC: boolean
    advertisementPositions: any[]
    advertisements: any[]
    footerTop: number
    handleScreenResize: () => void
    getAdvertisements: (page: string) => Promise<void>
    setFooterTop: () => void
  }
}