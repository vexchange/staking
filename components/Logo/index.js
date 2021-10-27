import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      src="/vex-ticker.png"
      alt="Picture of the author"
      width={40}
      height={40}
    />
  )
}
