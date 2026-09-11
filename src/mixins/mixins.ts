import { advertisementPositions } from '@/utils/enum'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { isMobile, isPad, isPC, updateResponsive } from '@/utils/responsive'

type MixinThis = any

const mixins = {
  data() {
    return {
      advertisementPositions,
      advertisements: [] as any[],
      footerTop: 0,
    }
  },
  computed: {
    isMobile() {
      return isMobile.value
    },
    isPad() {
      return isPad.value
    },
    isPC() {
      return isPC.value
    },
  },
  mounted(this: MixinThis) {
    this.handleScreenResize()
    this.setFooterTop()
    window.addEventListener('resize', this.handleScreenResize)
    window.addEventListener('scroll', this.setFooterTop)
  },
  beforeUnmount(this: MixinThis) {
    window.removeEventListener('resize', this.handleScreenResize)
    window.removeEventListener('scroll', this.setFooterTop)
  },
  methods: {
    handleScreenResize() {
      updateResponsive()
    },
    async getAdvertisements(this: MixinThis, page: string) {
      const positions: string[] = []
      this.advertisementPositions.map((item: any) => {
        if (item.value === page) {
          ;(item.children || []).map((child: any) => {
            positions.push(child.value)
          })
        }
      })
      const res: any = await getAdvertisementByPosition({ position: positions })
      if (res.status === 200) {
        this.advertisements = res.data.advertisement || []
      }
    },
    setFooterTop(this: MixinThis) {
      try {
        this.footerTop = document.querySelector('footer')?.getBoundingClientRect().top
      } catch (error) {
        // ignore
      }
    },
  },
}

export default mixins