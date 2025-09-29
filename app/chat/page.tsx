"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, FileText, Download, User, Bot, AlertCircle, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { AuthHeader } from "@/components/auth-header"
import Image from "next/image"

// Base64 encoded logo
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjUAAAIBCAYAAACx/k4jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAACr7SURBVHhe7d15YFxlvf/xz5k1M8lM0uxJS0tbKFD2pUXWsqqAoAjloiwFLCIosnhVEHeRiwjUegVFkVVBvCxXrHKBoiyClspSoIBspVvaNE2zT5JZzvz+KPCTh5Y2yUxyzjPv1z+F53saSktm3jxnGUdSXgAAAD4XMBcAAAD8iKgBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFR1LeXARGKlhZp+ikXRSqGa/QuEY5gZB5CFBwbl+nsl1tyrQuU3rVq3IHU+YhACxG1KBggpV1Sh4wW/HdD1N8+oFyIjHzEGDUZNtWKPXKk+p54vfqf22R3IE+8xAAliFqUBBVHz9HVR+dq3DTVDmBoDkGxkw+M6iev9+n9ruvVKZ1mTkGYBGiBiPWdNEtqtj7KDnhMnMEeMbgqlfUev25GnjzOXMEwBJEDUZk0lVPKTpxJ8nhmnN4Xz49oNVXnqjU0ifMEQAL8E6EYWu++DZFmrcjaOAbTqRME769QPHdDjVHACzAuxGGpe7MqxTf/Qg54ag5AjxvwmX/+07YOOYIgI8RNRiy2C4HK7HvJxUoKzdHgG+8FzYOYQPYgqjBkCX3O0GBeNJcBnxnwmX3qXy3wwgbwBJEDYYkOnG6yvc8UoFo3BwBvjT+G/eqfPcjCBvAAkQNhqRsx/3kRHmoHuwy/tK7CRvAAkQNhiS2w34KRNilgX3+f9jwsgj4Fd+9GJJgZa3EE4NhqfGX3q3yPQgbwK/4zsWQhJJ1coJEDew1/pL/UfmeR0oBXh4Bv+G7FkMSiMb5v1hYb/zXf6/yPT5K2AA+w3csAGzC+K/fpYo9P8YHtAI+QtQAwGY0f+13KidsAN8gagDgQzR/7U6V70XYAH5A1ADAFjR/9U6V7/1xwgbwOKIGALZC83/e8U7YhMwRAI8gagBgKzX/5x0q3+coOUHCBvAiogYAhqD5K79R+d5HEzaABxE1ADBEzV+5XeX7EDaA1xA1ADAMzRffrooZx8gJhs0RgDFC1ADAMDVddJsqZhxN2AAeQdQAwAg0XXSbKmZ+Qk6IsAHGGlEDACPUdOEtqphB2ABjzZGUNxeBzZk8/zmFG6eYy0Ux8OYzcgf7zWVA0Um7KlheaS6PuTXzz1Tv0wuUz6bNEYBRQNRgSEYzatZed456Ft2v/GDKHKGERSftqsbzrld0293MkSesmX+Wep/+I2EDjAFOPwFAATVdcJMqZh4nJxQxRwCKjKgBgAJruuDXSux7nJxw1BwBKCKiBgCKoPHLhA0w2ogaACiSxvNvVGLfTxI2wCghagCgiBrP/5USH/kUYQOMAqIGAIqs8Uu/JGyAUUDUAMAoaPzSL5XY73g54TJzBKBAiBoAGCWNX7xBif0+TdgARULUAMAoavziz5Xc/9NyIoQNUGhEDQCMsobzfq7k/ifIicTMEYARIGoAYAw0nHv9Ozs2hA1QKEQNAIyRjWHDjg1QKEQNAIyhhnOvU/KAE+RECRtgpIgaABhjDV+4TskDZsuJxs0RgCEgagDAAxrO+W/CBhghogYAPKLhnJ8SNsAIEDUA4CEN5/xUyQNPUiBabo4AbAFRAwAe0/D5+UocNFuBMsIGGAqiBgA8qOHs+Uoc+B+EDTAERA0AeFTD2fOUOIiwAbYWUQMAHtYwd54SB52sQFmFOQJgIGoAwOMa5l6rxMGEDbAlRA0A+EDD565RYtbJCsQIG2BziBoA8ImGs65R8uDPKBBLmCMARA0A+Ev9WVcrOYuwATaFqAEAn6k/88dKzvosYQMYiBoA8KH6M69S8hDCBvh3RA0A+FT9GVcpecgpCsST5ggoSUQNAPhY/Rk/UnIWYQOIqAEA/6s/40p2bACiBgDsUD/nSlUecpoC8UpzBJQMogYALFE35wpVHnoqYYOSRdQAgEXqTr9ClYedqkA5YYPSQ9QAgGXqTrtClYeeRtig5BA1AGChutN+qMrDTlegvMocAdYiagDAUnWnXk7YoKQQNQBgsbpTf6DKw+cQNigJRA0AWK7ulO+r8vAzFKgYZ44AqxA1AFAC6k75nqoOm6MgYQOLETUAUCJqT/meKg8nbGAvogYASkjtZ7+nyiPOJGxgJaIGAEpM7We+807YVJsjwNeIGgAoQbWf+Y4qjzxTwQRhA3sQNQBQompP/rYqjziLsIE1iBoAKGG1J39LlUd+TsFEjTkCfIeoAYASV/sf31TigBMViCXMEeArRA0AQPVnXqXkIacQNvA1ogYAIEkad9S5Ktt+H8nhrQH+xH+5AABJUrhhWyUPPEnhhsnmCPAFogYA8J7yvT+u6KSd5QTD5gjwPKIGAPCeYEW1yqbupWCSu6HgP0QNAOB9IhN24hZv+BJRAwB4n0jTVAXKq8xlwPOIGgDA+wQrquREysxlwPOIGgDA+wTKxykQjprLgOcRNQCA93GCIZ5VA1/iv1oAAGAFogYAAFiBqAEAAFYgagD4SqZtudyBlLkMAEQNAH9xU91qv+sH6n/178pn0+YYQAlzJOXNRWBzJs9/TuHGKeZyUay97hz1LLpf+UH+rxwfFG6YrNj0AxQa1yQnEDTHVkocOFuRpu3M5aJoufoU9S5eYC4DnkbUYEiIGmBsRCZOV8PZ8xWbNtMcFQVRAz/i9BMAALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACs4kvLmIrA5k+c/p3DjFHO5KNZed456Ft2v/GDKHKHAnGBYwcpahcY1KVTd9L4fg9VNyqd6lO1Yo+yGNR/40R3sk/K8jBRbZOJ0NZw9X7FpM81RUbRcfYp6Fy8wlwFPI2owJESNPcJNU1W+80Eq3+soxaYfqECswjxkqwyuWKrUcw+pb8lCDbzx3MbIQcERNcCWETUYEqLGvwKxCpVN3Uux6QepfLfDFJ20i5xImXnYiGTWr1L/0ieUWvq4Ui8/oeyGNVIuax6GYSBqgC3jmhrAcoFwmZKzPqsJ3/6Txl96j2pO+JrKtt+n4EEjSeHaCUrO+owaz/u5Jl3xqOpP+6EijVOlAC81AIqPVxrAYhUzPqHmS36v+rnXqmzKHnJCEfOQogkma1V11Bc0/rL7VHPCJQpVNZiHAEBBETWAheK7HqLmi29T4xdvUHyXWQpEYuYhoyZcP0k1J35d4y+7T+OOPk/BZK15CAAUBFEDWCQQT6rutMvVdOEtqtj3k8O++LcYohN3Vt2c/1LzxbcpNm2GnGDIPAQARoSoASwRaZysxi9cr8ojP6dgxThz7BmxnQ5Q4xd/qYoZxygQjZtjABg2ogawQNl2+6jpwttUMeNoX4RCuHGKGs67QcnD5yhQXmWOAWBYiBrA58r3+piaLvi1opN3kwJBc+xZgWhM9XOuVPVxFyhYVW+OAWDIiBrAx5KzPquGufMUrt/WHPlG9acuVu1JlylUO8EcAcCQEDWAT8V3O1Q1J3xVoZrx5sh3Kg8/Q5WHnsadUQBGhKgBfCiyzY6qn3Olwg2j83Tn0VBz4iWq2Pc4BWIJcwQAW4WoAXwmXLuNmr58syITdjRHvtcwd54q9j5Kzhg+VweAfxE1gI8EyqtUe+oPFGmcbI6sUXPSNxTbYV85wbA5AoAPRdQAPuEEgqo98RKV736Y1TsZ4YbJqj3pm4pss6PkOOYYADaLqAF8ovLwOarY73gF4pXmyDpl02Zo3DFfUrhuojkCgM0iagAfCNdNVPLgzypUWWeOrFUx81iVbT/T6l0pAIVF1AA+ULHf8Qo3bOurh+uNVKCsXIn9PqVQdbM5AoBNImoAj4tsM12Vh5yiYAnt0ryrYsYnFN/tUG7zBrBViBrA45L7f7okg+ZdiZnHslsDYKsQNYCHxabtq8R+n1awotoclYz4roeoYu+jPP3J4wC8gagBPCy+++EK8Gau2C6zSnq3CsDWIWoADyvbbm8F4lxPUjZlDwXKq8xlAHgfogbwqNi0fRVpmMyTdSUFE9WK77h/SZ+GA7BlRA3gUbFpMxWIJ83lklW23d5cVwPgQxE1gEdFt9ubW5n/TXTKHgpUcAoKwOYRNYAHhWrGKzJhBzmRMnNUssJ1ExVu2o4nDAPYLKIG8KDYtH0VjHHqyRTjFBSAD0HUAB4UrttGTiRqLpe8UM14BaLs1ADYNKIG8KBgspa7njYhmKiREyL2AGwaUQN4UDBZK4WIGlMwUS0nHDGXAUAiagBv2rhTw5u3aeNODb8vADaNqAE8KJiskcNOzQcEEzVywpx+ArBpRA3gMcFENdeNbI7jKFgxjt0aAJtE1AAeE0zWskvzITbu1hA1AD6IqAG8JhCU5JirAIAtIGoAj8n39yjvZs1lvCPX0658Jm0uAwBRA3hNLtUj5XLmMiQpn1eut0P5LFED4IOIGsBjXHZqNmvjLs2guQwAElEDeFDeVX6gV3LZrTHletrZpQGwWUQN4EG5VI/yRM0H5Ho2cD0NgM0iagAPcvt7lM9xCsq0caeG008ANo2oATwo297CjsQmZNevkjvYby4DgETUAN6UeuERuX0bzOWS1//6YuV6+H0BsGlEDeBB/a/+Q7mudimfN0clK7PmTWXWvqV8ZsAcAYBE1ADelM9l1LdkoXK9HeaoZPX/6x/Kda83lwHgPUQN4FH9//qH3FSXuVyyBpa/qBy/HwA+BFEDeNTAa08rs6GFW7sl5braNPD6P+X2ETUANo+oATzKHUyp/+Un2a2RNPD2EoIGwBYRNYCHpZ5fKLeH62r6X3pCue42cxkA3oeoATys/7VF6vn7vcr1lu5tzKkXH1XvMw9w0TSALSJqAI/rfupe5bpKd5ei5+k/KruhxVwGgA8gagCPS698WV2P/rYkw6Z38QKlXvir3P4ecwQAH0DUAD7Q+/f7lGl9u6Q+udsd6FPP3/+XXRoAW42oAXwg07ZC3Y/foWwJ7db0Pv1HDbz+tPJpPusJwNYhagCf6Hr0t+p7/mG5A73myDqDK5aq86EblWlbaY4AYLOIGsAn8plBdfxhngZXLFXezZpja7j93er4438rvfJlKe+aYwDYLKIG8JH0mjfVftcPlW1bYY6s0bHgZ+/sSPWZIwD4UEQN4DOplx5T+z1XK9u+2hz5Xtcjt26804sPrgQwDEQN4EPdj/1WXY/colx3uznyrb7nH1bHgv9Wdv0qcwQAW4WoAXyq/Z6r1P23/5Gb6jZHvjPwxjNa/9vvKN3yujkCgK1G1AA+1nbr19V640W+3t3ofPBXarnmVA2uWGqOAGBIiBrA53qevFst8+b4cpej7fbLtP6uy3nAHoCCIGoACwy88U+1/Gi2up/8H188x2Zw5StqueZUdT18k9y+TnMMAMNC1ACWSK9dpnU3Xqyuh2/29Cda97/8pNbdcL76nnlA7mDKHAPAsBE1gEXcVLfafvNNrfnJGepd9Ae5/d7ZtRlcsVRtt16qlnmnq//1xcrn7H2AIICxQdQAFkq9+Kharj1da687R6mXHpM7hp+flFm3XO13/0irf3i8Ov58Pc+gAVA0RA3gA04gKDmOubxFvYsXqOXKk7Tuxos18NbzymfT5iFFk+ter84HfqHVPzxe7fdcqWxnq3nIFg333xtAaSJqAI8LxJOqPe1yVR1+poIV48zxFrmZAXU/dodWff9Yrbn2dHUtvHnj3UZu4T9Xyc0MKPXio2q79VKt/NZH1Xb7ZUqvfXNY/6z49ANV/7lrFJs2U04wZI4B4AOIGsDDQtXNqj/rGlUeNkf1Z89T+T5HKxAtNw/bKm5/t3qfeUCtv7pQb1+wl1b/+GR1/fU3yvVsMA8dmryr/leeUtttl2r5Rfto1RWfVsefr1d67ZvDvm4mMn4H1Z5+hSqPOFP1Z89XfPfD5UTKzMMA4H0cSXlzEdicyfOfU7hxirlcFGuvO0c9i+5XvkTvkIk0b6+6OT9SfOcD5YSj762vuvw49S99snCf1B0IqGzqXgo3TFaoukmhcU0f+NHt71F2wxplO9Z84Mf+1xbJ7Snc3VaBWELjL71bsR0+8t5apr1F6+/8rvoW/8kXt6wXQ2TidDWcPV+xaTPNUVG0XH2KehcvMJcBTyNqMCREzegom7qnGub+RNFtd5UCQXOsVT88Xv1LHx/2TohXBcorNf6Suzf5xu0O9Kn9d99X9+O/U64En21D1ABbxuknwGPiOx+kpgtuVnTKHpsMGkmacNl9Sh52ugKxhDnyrei2u2qb7/xps2/agbJy1Z3xI1V9/BwFk7XmGACIGsBLyvc+Sg3nXq9ww2Rz9AENc+ep5tNfVbCyzhz5TsWMY9R80a2KTtrVHH1AzUnf0Lhjz1eoqsEcAShxRA3gEckDZqvhc9coXDfRHG3WuOMuUMPZ8xXddjdf3iEUiCdV/amvqH7uPIUbp5rjzao+7kJVf/qrCtWMN0cAShhRA3hA5eFnqPa0y4f1Jl0x4xg1XXSLkoeepkC80hx7Vtn2M9R43i9UffxXhrXrUvWxs1X7H99UuH6SOQJQoogaYIxVHn6GamZfqtC4RnO01SKNU9Vw9k9Ud+oPNp66crz7re2Eo6o89DQ1XXCzKmYco0DZ8G5Rl6TkrM9q3DFfGlYMArCPd1/5gBJQiKD5d5WHz9GES+7WuKPPVbCi2hyPufgus9R84a2qO+NHCtdtY46Hperjn1f1Jy8kbAAQNcBYKXTQvCvcvJ3qTr9CTRfcpIp9jh7RTkihRMbvoLpTL1fTBTepfJ+jCv5rqvrY51Uz+5IhXY8EwD5EDTAG4rsfrupPXVzwoPl38d0OVfNX79SEb/9JNSd8TdGJ0+WEwuZhRRNM1iix/wlquvAWTbz8YY079vyi3opdeejpqjrqCwpVN5kjACWCqAFGWaRpO9XPuXLULnAtm7qnak66TNtc/oiav3aXqj95kaLb7vq+pxQXSqiqQYkDTlTD2fM18YrH1HT+r5TY7/hRu4C56ogzVL7nR616fg+ArccThTEkPFF4ZIKJajV9+SbFph84qrsmm5JpeV19SxZq4K0lSq96VYOrXlU+3W8e9qHCdZMUmbCjohN2VHz3w1S2/YyCn1oaqsG3X9DaG87X4LIlUt6elzeeKAxsGVGDISFqRqZ+zn8pecipCsST5sgTMuuWK9O2Qrm+Trmpbrn9PXJT3QpEyhSIJRSIJxWIJRQa16hI8/ZyIjHzS3hCzz/u0/o7f6DM2jfNkW8RNcCWcfoJGCXJA2erYt9PeTZoJClcP0nxnQ9SYuaxqjzkFI076guqOeFrGnfsl1V5xJlK7H+Cyvf86MaH/Xk0aCQp8ZHjlfjIJxVMeO8OMADFQ9QAoyCYqFHi4M8qWFm8C2XxfokDZnM3FFBiiBpgFCQOnK3otrvICUXMEYokOnG6Ko+cS9gAJYSoAYosMn6aKg87XaGkvz54sv9f/1DrDefrrfN20rIL9tS6m76qwWUvKJ9Nm4d6VvLA2YrveogCZRXmCICFiBqgyOK7zFIwWSc5jjnyrM7/u0Fr5s1R119uU7a9RZm1b6nzwV+q5dpT1ffsg0O+S2qsOJEyxXc+2IpPMgewZUQNUGTx6QcpWO7di4P/nZvuV9utl2r9769QtmOtOVZm3XKtve4L6v3nn30TNrEd9i3qQ/8AeAdRAxRRbKf9FZ28m5xwmTnynPTqf2nlZYer48/Xy+3rNMfvcQd6tWb+Wep56j65A33m2HNCdRMV33WWgokacwTAMkQNUETx6QeN2tN0R2Jg2RK1XHu6BlcsNUebtfbn56rnqXt9ETaxaR9RMEnUALYjaoAiCUTKFN/lYE8/l0bvBM3an31e6VWvmqMtWvfri9T3wl+UzwyaI0+J7bCvwjXj5QSC5giARYgaoEhCjVMUHNcoJxgyR56RbnlN62+7bNhP3s1nM1p/x3c18PYLkuuaY88IxJMKN28nZ4w/wgFAcRE1QJFEGqYo4PFrabr+crsGlr+ofDZjjrZaZs0b6rj/p8q0LTdHnhKumzTmn0sFoLiIGqBIwk1T5ES8GzUDbzyjvmcf/NCLgrdWaslCZdev9vRuTah+kgJRogawGVEDFEmkwdtRk1m3vGC3ZbuDKfUtWahsz3pz5BmR+kmcfgIsR9QARRJunOLpW7mDFVVygmFzediccFSO492XFE4/Afbz7isQ4GNOOKpgosbTFwnHdztM8T2PLMjdWWVT9lLFRz7l6YfcBcqrFIjEfPVkZwBDQ9QARRCIV0o+uH143LFfVvluhykQjZujrRasrNO4476sSP225shznJC3d5MAjAzf3UARBONJOUHvR024ZrwaPv9TlU2bOexdpbrTfqiKvT4uJxozR57jRCK+iE0Aw0PUAEUQKE/KCQwvEkZboLxS479xr2I7HTDkN/yGufNUsc/RvggavbNTowAve4Ct+O4GiiAY88fpp3c5gaAmfOt+VX107lZdYxMoq1D93HlKHHCiArGEOfauUESO458/FwBDQ9QAReCUJ4d9Omcs1Z95leo+812FqpvN0XsiE3ZS3Vk/VvKAE7cqgLwkEGanBrAZ391AEfhtp+bfRafNUGzngzYZLOV7HKmGudcquf8Jm5x7nUPUAFbjuxsohnxOUt5c9bTB5S9q3U1f1eoffFI9T9wlN9VtHqK+5x/Wyu8epZYff0a9ixfI7e81D/G2vL/+TAAMDVEDFIGbGfTVG2jnwpu1+sqT1PngL5Xr3WCOP6BvySNqufoUtd3ydWXXrzLHnpXPZX315wJgaIgaoAjy6QFPfw7Sv9vwh5+o/fdXKLuhxRxtUdejv9H6O7+vTNsKc+RJeTcn5f3x5wJg6IgaoAjymQHlPf7mmeter7bbL1PH/T9RrmudOd5q3X+7S6uvnK3B5S+ZI+9x2akBbEbUAEWQTw96fkeg+9HfqueJ3yvX22GOhiy96lV1Lbx5WLs9o4nTT4DdiBqgCNyM908/ZdpXb/x1FsjAG88o19dlLnuLm1OeqAGsRdQARZDP9Hv+9JMTDEmF/BykUFiOxz8sMp/jmhrAZgV8RQPwro2nn7y9I+CEIgWNECcYLmwkFQPX1ABW8/grEOBPvrj7KVTYCHFCYamAkVQMXFMD2K1wr2gA3uNmBn1w+qmwEeKLnRpOPwFW8/grEOBP+cyA5988N+6sFPAlwA/X1LhZ5X32pGcAW6+Ar2gA3pVP+yFqCnxNTShS2EgqBjfH6SfAYh5/BQL8KZ9NK5/NePoNtPCnn0IF/XqFlnezXFMDWI6oAYok19epvJs1l72jwKefnFDE05+A7fZ1bwxNANby7isQ4HNuX9fGC1M9KhCNSYGguTxsTjQmp4Bfr9Dc/m7lc0QNYDOiBigSN9Xt6Z2aQCy58ZRRgQRjCamAX6/Q3FQPOzWA5YgaoEhyfZ2e3qkJxgsbNYFYUk6gcF+v0HL93RI7NYDViBqgSNy+Lk/v1DixRGFPP8USBY2kQuOaGsB+RA1QJLlU58a7bTwqGC9shHj+9BPX1ADWI2qAInH7ujY+F8WjCn1NTaDAkVRoboqdGsB2RA1QJG6qy9M7NYFYQirgNTABr59+YqcGsB5RAxRJrrdT8nDUOOGonEisIM+qKeTXKpZcX7fETg1gNe++AgE+56a6lPfw6ScV8Loar+/S6L2dmrS5DMAiRA1QJLk+b59+UgFjJBBLePp2bnFNDVASiBqgSNxUp6cvFFYBb+sOePzOJ70bNVxTA1iNqAGKJJ8eVK5ng6d3awr1AL5C7fgUS66nXW5/t+R6+5PTAYwMUQMUUWbdMuUzA+ayZwRiyYLssAQKFEfFkl79mtxUj7kMwDJEDVBEmda3lU97OWoKcy2M1x+8l255TW4/UQPYjqgBiijT6vGdmnhhYsQp0F1UxZJueX3j6ScAViNqgCJKt74tNz1oLntGoZ4C7PWdmkzrMrn9feYyAMsQNUAReX2nJligj0rw8id0Z9tWKNuxljufgBJA1ABF5PZ1Ktu2UvmsNx/6Vqhbur38Cd2DXCQMlAyiBiiygTefkdvfay57Qri6WYFwmbk8ZOHqJjmRkX+dYsisfUvugDd//wEUFlEDFNnAm8959k01WFknJ1Y+os9sckJhBavq5YQi5sgTMq3LPPv7D6Cwhv9KBmCrDK58WfnBlLnsGaFxzXLCUXN5q238+d7cpcnnskqvfVN5j+6UASgsogYosmz7ag2uesWzz6sJ1zQrEBlB1NQ0K+DVU09r3lCuc53nP1gUQGEQNcAoSK9YKnfQm7cUh6pHttMSGtc0op9fTJnWtzn1BJQQogYYBQPLXpQ74NGoqRnh6aeaZs9eJDy4YqlyfV3mMgBLETXAKBh4459yezZI+bw5GnPBEV4Ts3GnZvhRVCy53k6lXnlSbk+7OQJgKaIGGAW57vXqf22RJz9/KFzTLMfCa2oGXl+s7PqVXE8DlBCiBhglA6//05PXd4z8mpqR/fxiGXh9sXI9G8xlABYjaoBRMvDGM57cqZGk6IQdFCgrN5e3KDJhBwViQ/95xZbtbFXq5SeU49QTUFKIGmCUpNe+qYE3npXrwWfWRCbsqEBZhbm8RZHxOwzr5xXbwOuLletc58lrmAAUD1EDjKK+5x+W29thLo+5yIQd5Qx7p8Z7UZN6+Ullu9vMZQCWI2qAUdT3zAMaXPGy5z7gcuOOyzCiptl7OzWDy55X/8t/k8ut3EDJIWqAUeQOptT7zz957gLWcO02CtdNHNLnNwUr6xVpmionEjNHYyq19G/Kda0zlwGUAKIGGGV9z/6fsu2rJY/dajzU3ZrI+O09t0uT616vviWPKNe93hwBKAFEDTDKshvWqHfRH5Tr9dZuTaR52pCuq4k0TxtSBI2G1NInlFn3tvK5rDkCUAKIGmAM9D7zgLIeuzsn0jxNgejWR0q0eZqndmrymUGlXvjLxrueAJQkogYYA+nVr6n7r79RzkN36JRtv7ci2+y0VQ/Si24zXbFdZylQXmmOxkzPU/co9dJjnnzAIYDRQdQAY6T7qbs1uOpV5XMZczRmYtNmKrgVoRLfdZaCiRpzecxk1r6lrr/cpsz6leYIQAkhaoAxkutcp+7H71Suy0O7NdNmKFBeZS6/TzBRrfI9Pqpg0jtR0/3UPUqveUNyXXMEoIQQNcAY6nnqHvW/tkj5dL85GhOx7WcqefDJClbWmaP3VOxztCLjp8kJhs3RmEi99Lh6nrzHU3EIYGwQNcAYyqcH1f3Yncp66A05ceBsRcfvKCcYMkcKJqpV8ZHjFayqN0djwk11qfvxO5Vdv8IcAShBRA0wxvqefVBdD93omYuGw7XbqPrEryncsK05UtXR56ls6l5DekhfMXU9cqtSL/xF7kCfOQJQgogawAM23D9fvc8+5Jk35/jOB6t+7jxVHXmWgonqd/7+WlUd+TkFE9Xm4WOi95kH1PXIrcp2rDVHAEoUUQN4ROvPz9Pgypc98+yad8Nm6o3LNOHbf/RU0KTXvK6OBT9TZt3b5ghACSNqAA9pve4cpVf/y1yGoWvhrUovf4knBwN4H6IG8JD0mjfVctXJSq96xRzhnacGr7/ju+p+7A7l+jrNMYASR9QAHpNuXabVPzpZg8tf8sypKC9w+zrV9ttvq2vhzcr1tJtjACBqAC/KrHtbLVefotSSR5TPDJrjkpPtaFXb7d9ihwbAhyJqAI/KrHtbrb/+ivqef9gzD+cbC5nWZWq77VL1/P0eualucwwA7yFqAA/LrHtba3/xJXUs+FlJnnLpW7JQa352tnqfvt8zt7sD8C6iBvA4t7dD6++6XOtu+k9l1r5VEtfZ5LMZdTzwc7X+4nwNvLZY+ax3PvQTgHcRNYBP9Dx1r1p+Mke9i/5g9a5FetWrav3Vl9X++yuU3dBijgFgs4gawEcGl72gtdedq7bbv6nB5S9ZtYOR7WxV50M3quWa09T9+F1cPwNgyIgawGfcdEpdC2/Sqh8cp7ZbL/F93GTWr1THgp9t/Pe55etKt7wmuTnzMADYIqIG8KlcT7s6H7rRt3GTWfOGNtz7Y6363jFq+823lF71Kk8IBjAiRA3gc+/GzcrvHKU1156uroW3KLthjeS65qFjzu3rUu/iBWr9+Re14ltHav1dlyuzbrmU996vFYD/EDWAJdz+bvU+82e1/uoCLf/6gVrz08+p+/HfKdfbYR46qvJuTv0v/01tt1+mFd84RGvmzVHXo79RrmeDeSgAjIgjyf77Q1Ewk+c/p3DjFHO5KNZed456Ft2v/GDKHGEIQjXjFZ28u6Lb7KTohB0VmbCDIs07yImUmYcWRGb9SqVX/0vpVf9SetWrGnjrOaVXv658ZsA8FEMQmThdDWfPV2zaTHNUFC1Xn6LexQvMZcDTiBoMCVFjh0C4TOHGyYpM2FGRpqkKJmoVKE8qEK9UIF6pYDypQHmlAvGkgvFKuel+ualu5VJdcvu65aa6Nv51qltuX7cy61e8EzKvbtwZ8uCpL78jaoAtI2owJEQNMDaIGmDLuKYGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAVHUt5cBDZn8vznFG6cYi4DsEzL1aeod/ECcxnwNHZqAACAFYgaAABgBaIGAABYgagBAABWIGoAAIAViBoAAGAFogYAAFiBqAEAAFYgagAAgBWIGgAAYAWiBgAAWIGoAQAAViBqAACAFYgaDEmup11yc+YyAIu4qS7ls4PmMuB5RA2GJNfTrjxRA1gt19elfIaogf8QNRiS9Lrlymcz5jIAi2Q71sgd6DOXAc8jajAk/S8+pvwgL3aAzQbfeFbZjlZzGfA8ogZDMvDms3LTA+YyAIsMrnpVbk+7uQx4HlGDIcl2rFHXX26Tm+oyRwAs0Pvs/2ng9cVy0/3mCPA8ogZD1v3YHcqsXcZdUIBl3FS3ehfdr0zrMnME+AJRgyHLtq9W54M3KNfXaY4A+Fjvoj+o/5Wn5A6mzBHgC0QNhqXr0TvU89S93CEBWGLgtafVufAWdmnga0FJ3zUXga3R99xDcoIhlU3eXU44ao4B+ETfsw+p7dZLNLhsiTkCfMWRlDcXgaGomPEJ1Zz0DUUm7CgnEDTHADwq19uhrkduVeeDv1K2fZU5BnyHqEFBBCvrlDxgtiqPOFPhpqnEDeBhud4O9f3zz+p65BYNLFvC04NhDaIGBRWMJxXbaX/FdztMsZ0OUGT8DnJCYfMwAKMs296igbeeVeqlx5R64a/KrHubp4PDOkQNiioQjSsycWeuuQHGSD4zoEzrMuV6OqS8a44BqxA1AADACtzSDQAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAArEDUAAMAKRA0AALACUQMAAKxA1AAAACsQNQAAwApEDQAAsAJRAwAArEDUAAAAKxA1AADACkQNAACwAlEDAACsQNQAAAAr/D90MZ/X1jDcXwAAAABJRU5ErkJggg=="

interface Message {
  id: string
  type: "user" | "assistant" | "error"
  content: string
  timestamp: Date
}

interface UserQuery {
  id: string
  job_description: string
  topics: any
  cheat_sheet_content: string | null
  created_at: string
}

export default function ChatPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your AI assistant for creating cheat sheets. Paste a job description below, and I'll analyze it to create a personalized study guide with all the key skills and topics you need to master.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCheatSheet, setGeneratedCheatSheet] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null)
  const [currentQueryId, setCurrentQueryId] = useState<string | null>(null)
  const [queryHistory, setQueryHistory] = useState<UserQuery[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      await loadQueryHistory(user.id)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadQueryHistory(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const loadQueryHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_queries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setQueryHistory(data || [])
    } catch (error) {
      console.error("Error loading query history:", error)
    }
  }

  const saveQueryToDatabase = async (jobDescription: string, topics: any, cheatSheetContent: string | null = null) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("user_queries")
        .insert({
          user_id: user.id,
          job_description: jobDescription,
          topics: topics,
          cheat_sheet_content: cheatSheetContent,
        })
        .select()
        .single()

      if (error) throw error

      // Reload history to show the new query
      await loadQueryHistory(user.id)
      return data.id
    } catch (error) {
      console.error("Error saving query:", error)
      return null
    }
  }

  const updateQueryWithCheatSheet = async (queryId: string, cheatSheetContent: string) => {
    try {
      const { error } = await supabase
        .from("user_queries")
        .update({ cheat_sheet_content: cheatSheetContent })
        .eq("id", queryId)

      if (error) throw error

      // Reload history to show updated content
      await loadQueryHistory(user!.id)
    } catch (error) {
      console.error("Error updating query with cheat sheet:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const jobDescription = input
    setInput("")
    setIsLoading(true)

    try {
      const analysisResponse = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze job posting")
      }

      const { analysis } = await analysisResponse.json()
      setCurrentAnalysis(analysis)

      // Extract topic list from analysis instead of showing full text
      const topicsList = extractTopicsList(analysis)

      const queryId = await saveQueryToDatabase(jobDescription, { topics: topicsList })
      setCurrentQueryId(queryId)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I've analyzed the job posting and identified key topics for your cheat sheet:\n\n${topicsList}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const cheatsheetResponse = await fetch("/api/generate-cheatsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis }),
      })

      if (!cheatsheetResponse.ok) {
        throw new Error("Failed to generate cheat sheet")
      }

      const { cheatsheet } = await cheatsheetResponse.json()
      setGeneratedCheatSheet(cheatsheet)

      if (queryId) {
        await updateQueryWithCheatSheet(queryId, cheatsheet)
      }
    } catch (error) {
      console.error("Error processing job description:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content:
          "I'm sorry, there was an error analyzing the job posting. Please try again or check if you have a valid OpenAI API key configured.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to extract topics list from analysis
  const extractTopicsList = (analysis: string): string => {
    const lines = analysis.split("\n")
    const topics = []

    for (const line of lines) {
      const trimmed = line.trim()
      // Extract main topics and technologies
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        const topic = trimmed.replace(/^[-•]\s*/, "").replace(/\*\*/g, "")
        if (topic && !topic.includes(":") && topic.length < 50) {
          topics.push(`• ${topic}`)
        }
      }
      // Extract technologies from bullet points
      if (trimmed.match(/^\s*-\s*\*\*[^:]+\*\*/)) {
        const tech = trimmed.replace(/^\s*-\s*\*\*/, "").replace(/\*\*.*$/, "")
        if (tech.length < 30) {
          topics.push(`• ${tech}`)
        }
      }
    }

    // If no topics found, create a generic list
    if (topics.length === 0) {
      return "• Technical Skills\n• Core Concepts\n• Interview Questions\n• Code Examples\n• Study Resources"
    }

    // Return unique topics, limited to 15 items
    return [...new Set(topics)].slice(0, 15).join("\n")
  }

  const handleDownloadPDF = async () => {
    if (!generatedCheatSheet) return

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: generatedCheatSheet }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "interview-cheatsheet.pdf"
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      // Fallback: show the content in a new window for now
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(
          `<pre style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${generatedCheatSheet}</pre>`,
        )
      }
    }
  }

  const loadPreviousQuery = (query: UserQuery) => {
    setMessages([
      {
        id: "1",
        type: "assistant",
        content:
          "Hi! I'm your AI assistant for creating cheat sheets. Paste a job description below, and I'll analyze it to create a personalized study guide with all the key skills and topics you need to master.",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "user",
        content: query.job_description,
        timestamp: new Date(query.created_at),
      },
      {
        id: "3",
        type: "assistant",
        content: `I've analyzed the job posting and identified key topics for your cheat sheet:\n\n${query.topics?.topics || "Loading topics..."}`,
        timestamp: new Date(query.created_at),
      },
    ])

    if (query.cheat_sheet_content) {
      setGeneratedCheatSheet(query.cheat_sheet_content)
    }

    setShowHistory(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={logoBase64} alt="Jobsy Logo" width={48} height={48} className="h-12 w-12" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">Jobsy</span>
              <span className="text-xs text-muted-foreground">CheatSheet Creator</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              History ({queryHistory.length})
            </Button>
            <AuthHeader />
          </div>
        </div>
      </header>

      {showHistory && (
        <div className="border-b border-border/40 bg-card/30 p-4">
          <h3 className="font-semibold mb-3">Recent Queries</h3>
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {queryHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous queries found.</p>
            ) : (
              queryHistory.map((query) => (
                <Card
                  key={query.id}
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => loadPreviousQuery(query)}
                >
                  <p className="text-sm font-medium truncate">{query.job_description.substring(0, 100)}...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(query.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {(message.type === "assistant" || message.type === "error") && (
                  <div className="flex-shrink-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.type === "error" ? "bg-destructive/10" : "bg-primary/10"
                      }`}
                    >
                      {message.type === "error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                )}

                <Card
                  className={`max-w-[80%] p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.type === "error"
                        ? "bg-destructive/10 border-destructive/20"
                        : "bg-card border-border/40"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </Card>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <Card className="bg-card border-border/40 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing job posting...</span>
                  </div>
                </Card>
              </div>
            )}

            {generatedCheatSheet && (
              <div className="flex justify-center">
                <Card className="bg-primary/5 border-primary/20 p-6 max-w-md">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Compact Cheat Sheet Ready!</h3>
                    <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a job description here to generate a cheat sheet..."
              className="flex-1 min-h-[60px] max-h-[120px] bg-input border-border resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="bg-primary hover:bg-primary/90 px-6">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
