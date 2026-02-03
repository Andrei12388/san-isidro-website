'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { SidebarProvider } from './ui/sidebar'

const menuItems = [
  { name: 'Updates', href: '#updates' },
  { name: 'Discipleship', href: '#discipleship' },
  { name: 'Organizational Chart', href: '#org' },
  { name: 'About Us', href: '#about' },
]


export const HeroHeader = ({
  item,
}: {
  item: {
    name: string
    email: string
    avatar: string
  }
}) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    const [active, setActive] = React.useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [hideAuth, setHideAuth]= useState(false)
    const fetchOnce = useRef(false) // ✅ track fetch status
  
  useEffect(() => {
    if (fetchOnce.current) return

    const fetchUserFromCookies = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch session from cookie
        const sessionRes = await fetch('/api/auth/getSession')
        if (!sessionRes.ok)
          throw new Error(`Failed to fetch session: ${sessionRes.status}`)

        const sessionData = await sessionRes.json()
        console.log('Fetched session data:', sessionData)

        // Only use cookies data; no backend fetch
        if (sessionData.user) {
          setUser(sessionData.user)
          setHideAuth(true) // hide auth buttons if user exists
        } else {
          setUser(null)
          setHideAuth(false)
        }

        fetchOnce.current = true
      } catch (err: any) {
        console.error('Error fetching user session:', err)
        setUser(null)
        setHideAuth(false)
        setError(err.message || 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserFromCookies()
  }, [])


  


React.useEffect(() => {
  const sections = document.querySelectorAll('section[id]')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
            console.log(`on page ${entry.target.id}`)
          setActive(`#${entry.target.id}`)
        }
      })
    },
    {
      rootMargin: '-40% 0px -50% 0px',
    }
  )

  sections.forEach((sec) => observer.observe(sec))

  return () => observer.disconnect()
}, [])

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 500)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className=" fixed z-50 w-full px-2">
                    {!isLoading && 
                <div className={cn(' mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 lg:rounded-2xl lg:border lg:backdrop-blur-lg lg:px-5', isScrolled && 'lg:bg-background/50 max-w-4xl lg:rounded-2xl lg:border lg:backdrop-blur-lg lg:px-5')}>
                    <div className=" relative flex flex-col gap-6 py-3 lg:gap-0 lg:py-4">
                        <div>
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo className='lg:block hidden' />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                            </button>
                            
                           {user &&  <SidebarProvider className='absolute right-5 top-0 m-auto w-50 h-20'
    >
                             <NavUser item={item}/>
                             </SidebarProvider>
                             }
                        </div>

                        <div className="z-50 absolute inset-0 m-auto mt-5 hidden size-fit lg:block">
                            <ul className="m-auto mt-3 items-center flex gap-4 text-sm">
                                
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                    href={item.href}
                                    className={cn(
                                        "relative block text-muted-foreground transition-colors duration-200 ",
                                        "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-current text-red-500 after:origin-left after:transition-transform after:duration-300",
                                        active === item.href
                                        ? "text-accent-foreground after:scale-x-100"
                                        : "hover:text-accent-foreground after:scale-x-0 hover:after:scale-x-100"
                                    )}
                                    >
                                    {item.name}
                                    </Link>
                                    </li>
                                ))}
                                
                            </ul>
                            
                        </div>
                        </div>

                        <div className="lg:border-none border lg:bg-transparent lg:backdrop-blur-none bg-white backdrop-blur-lg ml-auto in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden lg:w-full flex-wrap items-center justify-end space-y-8 rounded-3xl  p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex  lg:gap-6 lg:space-y-0  lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                    href={item.href}
                                    className={cn(
                                        "relative block text-muted-foreground transition-colors duration-200 ",
                                        "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-current text-red-500 after:origin-left after:transition-transform after:duration-300",
                                        active === item.href
                                        ? "text-accent-foreground after:scale-x-50"
                                        : "hover:text-accent-foreground after:scale-x-0 hover:after:scale-x-100"
                                    )}
                                    >
                                    {item.name}
                                    </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {hideAuth ? <></> :
                            <div className={cn(hideAuth ? 'hidden' : ' flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit')}>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="#">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex hidden' : 'hidden')}>
                                    <Link href="login">
                                        <span>Connect with Us</span>
                                    </Link>
                                </Button>
                               
                            </div>
                            }
                            
                        </div>
                          
                    </div>
                   
                </div>
                }
                
            </nav>
            
        </header>
    )
}
