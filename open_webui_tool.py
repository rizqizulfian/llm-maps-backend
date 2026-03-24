"""
title: Google Maps Master Tool
author: Your Name
version: 5.2
"""

import requests

class Tools:
    def __init__(self):
        pass

    # TOOL 1: SEARCH FOR PLACES
    def get_location_map(self, location: str, place_type: str) -> str:
        """
        Use this tool ONLY WHEN the user wants to SEARCH for a list of places, restaurants, cafes, or addresses.

        :param location: The city or area name.
        :param place_type: The type of place to search for.
        """
        url = "http://host.docker.internal:8080/api/get-location"
        payload = {"location": location, "place_type": place_type}
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            return f"Please present the following Google Maps recommendations to the user exactly as formatted:\n\n{data.get('response_for_llm')}"

        except Exception as e:
            return f"Error retrieving location data: {str(e)}"

    # TOOL 2: SEARCH FOR ROUTES / NAVIGATION
    def get_route_info(self, origin: str, destination: str) -> str:
        """
        Use this tool WHEN the user asks about DISTANCE, TRAVEL TIME, or HOW TO GET from one place to another.

        :param origin: The starting point.
        :param destination: The final destination.
        """
        url = "http://host.docker.internal:8080/api/get-route"
        payload = {"origin": origin, "destination": destination}
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            return f"Please present the following route information to the user exactly as formatted:\n\n{data.get('response_for_llm')}"
        
        except Exception as e:
            return f"Error retrieving route data: {str(e)}"