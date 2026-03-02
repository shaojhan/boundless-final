export default function Footer() {
  return (
    <>
      <footer className="flex items-center justify-center">
        Copyright © 2024 Boundless. All rights reserved.
      </footer>

      <style jsx>
        {`
          footer {
            background-color: #000;
            color: #fff;
            height: 45px;
            width: 100%;
            font-size: 16px;
          }
        `}
      </style>
    </>
  )
}
