interface CTAButtonProps {
  color?: string
}

export default function CTAButton({ color }: CTAButtonProps) {
  return <button style={{ backgroundColor: color }}>CTAButton</button>
}
